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
  kind: 'all' | 'companion' | 'assistant';
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
  'romance',
  'sci-fi',
  'fantasy',
  'historical',
  'professional',
  'wellness',
  'gaming',
  'anime',
  'roleplay',
  'educational',
];

export function FilterBar({
  filters,
  onFiltersChange,
  availableCategories = DEFAULT_CATEGORIES,
}: FilterBarProps) {
  const activeFiltersCount = [
    filters.categories.length > 0,
    filters.kind !== 'all',
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
      kind: 'all',
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
          {/* Kind Filter */}
          <Select
            value={filters.kind}
            onValueChange={(value: any) => updateFilter('kind', value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="companion">Companion</SelectItem>
              <SelectItem value="assistant">Assistant</SelectItem>
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

                {/* Generation Tier */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Generation Tier</Label>
                  <Select
                    value={filters.tier}
                    onValueChange={(value: any) => updateFilter('tier', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tiers</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="plus">Plus</SelectItem>
                      <SelectItem value="ultra">Ultra</SelectItem>
                    </SelectContent>
                  </Select>
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
        filters.kind !== 'all' ||
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

          {filters.kind !== 'all' && (
            <Badge variant="secondary" className="gap-1 capitalize">
              {filters.kind}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => updateFilter('kind', 'all')}
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
              Tier: {filters.tier}
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
