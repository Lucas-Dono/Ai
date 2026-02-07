'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Cake, Briefcase, MapPin, Search, Check, AlertCircle, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StepContainer } from '../StepContainer';
import { useWizard } from '../WizardShell';
import { validateLocation } from '@/lib/services/validation.service';

/**
 * BasicsStep - Step 1: Character basics
 *
 * Collects:
 * - Name (required)
 * - Age (with slider for better UX)
 * - Gender (required)
 * - Location with validation (required)
 * - Occupation (optional, can be filled in background step)
 *
 * Uses backend validation service for location geocoding
 */

export function BasicsStep() {
  const { characterDraft, updateCharacter } = useWizard();
  const [locationInput, setLocationInput] = useState(characterDraft._uiState?.locationInput || '');
  const [isValidatingLocation, setIsValidatingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Name availability check
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);
  const [similarNames, setSimilarNames] = useState<Array<{ id: string; name: string }>>([]);
  const nameCheckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check name availability (debounced) with abort controller
  useEffect(() => {
    const name = characterDraft.name?.trim();

    if (!name || name.length < 2) {
      setNameAvailable(null);
      setSimilarNames([]);
      return;
    }

    // Clear previous timeout and abort pending request
    if (nameCheckTimeoutRef.current) {
      clearTimeout(nameCheckTimeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Set new timeout (500ms debounce)
    nameCheckTimeoutRef.current = setTimeout(async () => {
      setIsCheckingName(true);

      try {
        const response = await fetch('/api/v2/characters/check-name', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
          signal,
        });

        const data = await response.json();

        if (response.ok) {
          setNameAvailable(data.available);
          setSimilarNames(data.similarNames || []);
        }
      } catch (error) {
        // Ignore abort errors
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.error('Name check failed:', error);
      } finally {
        setIsCheckingName(false);
      }
    }, 500);

    return () => {
      if (nameCheckTimeoutRef.current) {
        clearTimeout(nameCheckTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [characterDraft.name]);

  return (
    <StepContainer
      title="Let's start with the basics"
      description="Tell us about your character's fundamental identity"
    >
      <div className="space-y-8">
        {/* Name */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Label htmlFor="name" className="flex items-center gap-2 text-base">
            <User className="w-4 h-4 text-brand-primary-400" />
            Character Name
          </Label>
          <div className="relative">
            <Input
              id="name"
              type="text"
              placeholder="e.g., Sarah Chen"
              value={characterDraft.name || ''}
              onChange={(e) => updateCharacter({ name: e.target.value })}
              className={`h-12 text-base pr-10 ${
                nameAvailable === false ? 'border-orange-500' : nameAvailable === true ? 'border-green-500' : ''
              }`}
              autoFocus
            />
            {/* Name availability indicator */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isCheckingName ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : nameAvailable === true ? (
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
              ) : nameAvailable === false ? (
                <X className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              ) : null}
            </div>
          </div>

          {/* Name status messages */}
          {nameAvailable === true && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <Check className="w-4 h-4" />
              <span>Name is available</span>
            </div>
          )}

          {nameAvailable === false && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                <AlertCircle className="w-4 h-4" />
                <span>You already have a character with this name</span>
              </div>
              {similarNames.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Similar names:</span> {similarNames.map(s => s.name).join(', ')}
                </div>
              )}
            </div>
          )}

          {!nameAvailable && (
            <p className="text-sm text-muted-foreground">
              Choose a name that feels authentic to your character
            </p>
          )}
        </motion.div>

        {/* Age */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Label htmlFor="age" className="flex items-center gap-2 text-base">
            <Cake className="w-4 h-4 text-brand-primary-400" />
            Age: {characterDraft.age || 25} years
          </Label>
          <div className="px-2">
            <Slider
              id="age"
              min={18}
              max={100}
              step={1}
              value={[characterDraft.age || 25]}
              onValueChange={([value]) => updateCharacter({ age: value })}
              className="py-4"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground px-2">
            <span>18</span>
            <span>100</span>
          </div>
        </motion.div>

        {/* Grid layout for Gender and Occupation */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Gender */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Label htmlFor="gender" className="text-base">
              Gender
            </Label>
            <Select
              value={characterDraft.gender || ''}
              onValueChange={(value) => updateCharacter({ gender: value as 'male' | 'female' | 'non-binary' | 'other' })}
            >
              <SelectTrigger id="gender" className="h-12">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="non-binary">Non-binary</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Occupation */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Label
              htmlFor="occupation"
              className="flex items-center gap-2 text-base"
            >
              <Briefcase className="w-4 h-4 text-brand-primary-400" />
              Occupation
            </Label>
            <Input
              id="occupation"
              type="text"
              placeholder="e.g., Software Engineer"
              value={characterDraft.occupation || ''}
              onChange={(e) => updateCharacter({ occupation: e.target.value })}
              className="h-12"
            />
          </motion.div>
        </div>

        {/* Current Location with Validation */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Label
            htmlFor="location"
            className="flex items-center gap-2 text-base"
          >
            <MapPin className="w-4 h-4 text-brand-primary-400" />
            Current Location
          </Label>

          <div className="flex gap-2">
            <Input
              id="location"
              type="text"
              placeholder="e.g., Berlin, Germany"
              value={locationInput}
              onChange={(e) => {
                setLocationInput(e.target.value);
                setLocationError(null);
              }}
              className={`h-12 flex-1 ${locationError ? 'border-destructive' : ''}`}
              disabled={isValidatingLocation}
            />
            <Button
              onClick={async () => {
                if (!locationInput) return;

                setIsValidatingLocation(true);
                setLocationError(null);

                try {
                  // Parse city and country from input
                  const parts = locationInput.split(',').map(p => p.trim());
                  const city = parts[0];
                  const country = parts.length > 1 ? parts[parts.length - 1] : '';

                  if (!city || !country) {
                    setLocationError('Please use format: City, Country');
                    return;
                  }

                  const result = await validateLocation(city, country);

                  if (result.valid && result.location) {
                    updateCharacter({
                      location: result.location,
                      _uiState: { locationInput }
                    });
                    setLocationError(null);
                  } else {
                    setLocationError(result.error || 'Location not found');
                  }
                } catch (error) {
                  setLocationError('Error validating location');
                } finally {
                  setIsValidatingLocation(false);
                }
              }}
              disabled={isValidatingLocation || !locationInput}
              size="lg"
              variant={characterDraft.location?.verified ? 'default' : 'outline'}
              className="px-6"
            >
              {isValidatingLocation ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : characterDraft.location?.verified ? (
                <Check className="w-4 h-4" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Location status */}
          {characterDraft.location?.verified && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <Check className="w-4 h-4" />
              <span>
                {characterDraft.location.city}, {characterDraft.location.country}
                {characterDraft.location.timezone && ` (${characterDraft.location.timezone})`}
              </span>
            </div>
          )}

          {locationError && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span>{locationError}</span>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Enter location as "City, Country" and click search to verify
          </p>
        </motion.div>
      </div>
    </StepContainer>
  );
}
