'use client';

import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export interface FilterState {
  search: string;
  categories: string[];
  gender: 'all' | 'male' | 'female' | 'non-binary';
  visibility: 'all' | 'private' | 'public';
  tier: 'all' | 'free' | 'plus' | 'ultra';
  nsfw: 'all' | 'sfw' | 'nsfw';
  sortBy: 'newest' | 'oldest' | 'mostUsed' | 'nameAZ' | 'nameZA';
}

interface FilterBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableCategories?: string[];
}

const DEFAULT_CATEGORIES = [
  'history',
  'literature',
  'psychology',
  'science',
  'art',
  'music',
  'philosophy',
  'adventure',
  'gaming',
  'technology',
  'nature',
  'wisdom',
  'business',
  'gastronomy',
];

export function FilterBar({
  filters,
  onFiltersChange,
  availableCategories = DEFAULT_CATEGORIES,
}: FilterBarProps) {
  const activeFiltersCount = [
    filters.categories.length > 0,
    filters.gender !== 'all',
    filters.visibility !== 'all',
    filters.tier !== 'all',
    filters.nsfw !== 'all',
  ].filter(Boolean).length;

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    updateFilter('categories', newCategories);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      categories: [],
      gender: 'all',
      visibility: 'all',
      tier: 'all',
      nsfw: 'all',
      sortBy: 'newest',
    });
  };

  return (
    <div className="space-y-4">
      {/* Main Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search characters..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-9 pr-4"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          {/* Gender Filter */}
          <Select
            value={filters.gender}
            onValueChange={(value: any) => updateFilter('gender', value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="non-binary">Non-binary</SelectItem>
            </SelectContent>
          </Select>

          {/* Quick Category Filter */}
          <Select
            value={filters.categories[0] || 'all'}
            onValueChange={(value: any) => {
              if (value === 'all') {
                updateFilter('categories', []);
              } else {
                updateFilter('categories', [value]);
              }
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="history">History</SelectItem>
              <SelectItem value="literature">Literature</SelectItem>
              <SelectItem value="psychology">Psychology</SelectItem>
              <SelectItem value="science">Science</SelectItem>
              <SelectItem value="art">Art</SelectItem>
              <SelectItem value="music">Music</SelectItem>
              <SelectItem value="philosophy">Philosophy</SelectItem>
              <SelectItem value="gaming">Gaming</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select
            value={filters.sortBy}
            onValueChange={(value: any) => updateFilter('sortBy', value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="mostUsed">Most Used</SelectItem>
              <SelectItem value="nameAZ">Name A-Z</SelectItem>
              <SelectItem value="nameZA">Name Z-A</SelectItem>
            </SelectContent>
          </Select>

          {/* Advanced Filters Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="ml-2 px-1.5 py-0 h-5 min-w-[20px] rounded-full"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Advanced Filters</h4>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-auto p-1 text-xs"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Clear all
                    </Button>
                  )}
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Categories</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                    {availableCategories.map((category) => (
                      <div
                        key={category}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`cat-${category}`}
                          checked={filters.categories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <label
                          htmlFor={`cat-${category}`}
                          className="text-sm capitalize cursor-pointer"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visibility */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Visibility</Label>
                  <Select
                    value={filters.visibility}
                    onValueChange={(value: any) =>
                      updateFilter('visibility', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="private">Private Only</SelectItem>
                      <SelectItem value="public">Public Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Complexity Level (informational only - all characters accessible) */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">Complexity Level</Label>
                    <span className="text-xs text-muted-foreground">(All accessible)</span>
                  </div>
                  <Select
                    value={filters.tier}
                    onValueChange={(value: any) => updateFilter('tier', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="free">Basic (Simple context)</SelectItem>
                      <SelectItem value="plus">Advanced (Rich context)</SelectItem>
                      <SelectItem value="ultra">Ultra (Deep personality)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Note: All characters are accessible. More complex ones use your daily limit faster.
                  </p>
                </div>

                {/* NSFW Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Content Rating</Label>
                  <Select
                    value={filters.nsfw}
                    onValueChange={(value: any) => updateFilter('nsfw', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Content</SelectItem>
                      <SelectItem value="sfw">SFW Only</SelectItem>
                      <SelectItem value="nsfw">18+ Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.search ||
        filters.categories.length > 0 ||
        filters.gender !== 'all' ||
        filters.visibility !== 'all' ||
        filters.tier !== 'all' ||
        filters.nsfw !== 'all') && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>

          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.search}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => updateFilter('search', '')}
              />
            </Badge>
          )}

          {filters.categories.map((category) => (
            <Badge key={category} variant="secondary" className="gap-1 capitalize">
              {category}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => toggleCategory(category)}
              />
            </Badge>
          ))}

          {filters.gender !== 'all' && (
            <Badge variant="secondary" className="gap-1 capitalize">
              Gender: {filters.gender}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => updateFilter('gender', 'all')}
              />
            </Badge>
          )}

          {filters.visibility !== 'all' && (
            <Badge variant="secondary" className="gap-1 capitalize">
              {filters.visibility}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => updateFilter('visibility', 'all')}
              />
            </Badge>
          )}

          {filters.tier !== 'all' && (
            <Badge variant="secondary" className="gap-1 capitalize">
              Complexity: {filters.tier}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => updateFilter('tier', 'all')}
              />
            </Badge>
          )}

          {filters.nsfw !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {filters.nsfw === 'sfw' ? 'SFW Only' : '18+ Only'}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => updateFilter('nsfw', 'all')}
              />
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-7 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
