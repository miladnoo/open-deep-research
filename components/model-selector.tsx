'use client';

import { startTransition, useMemo, useOptimistic, useState, useEffect } from 'react';
import { saveModelId } from '@/app/(chat)/actions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  models,
  providers,
  ModelCategory,
  getModelsByCategory,
  getModelsByProvider,
  getModelsByTag,
  Model,
  DEFAULT_MODEL_NAME
} from '@/lib/ai/models';
import { fetchAndUpdateModels } from '@/lib/ai/fetch-models';
import { cn } from '@/lib/utils';
import { 
  CheckCircleFillIcon,
  ChevronDownIcon,
  SearchIcon,
  SparklesIcon,
  BotIcon,
  CodeIcon,
  EyeIcon,
  GlobeIcon,
  TerminalIcon,
} from './icons';

// Constants for tooltips
const TOOLTIP_TEXT = {
  vision: 'Supports vision/image input',
  functions: 'Supports function calling',
  fast: 'Optimized for speed',
  reasoning: 'Advanced reasoning capabilities',
  coding: 'Specialized for code generation',
  'open-source': 'Open source model'
} as const;

export function ModelSelector({
  selectedModelId,
  className,
}: {
  selectedModelId: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [optimisticModelId, setOptimisticModelId] = useOptimistic<string, string>(
    selectedModelId || DEFAULT_MODEL_NAME,
    (_state, newValue) => newValue
  );
  const [searchText, setSearchText] = useState('');
  const [filterMode, setFilterMode] = useState<'category' | 'provider' | 'tag'>('category');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch models when component mounts
  useEffect(() => {
    const loadModels = async () => {
      try {
        await fetchAndUpdateModels();
      } catch (error) {
        console.error('Failed to fetch models:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadModels();
  }, []);

  const selectedModel = useMemo(
    () => models.find((model) => model.apiIdentifier === optimisticModelId || model.id === optimisticModelId),
    [optimisticModelId],
  );

  const filteredModels = useMemo(() => {
    let filtered = models;

    // Apply text search
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(
        model =>
          model.label.toLowerCase().includes(searchLower) ||
          model.description.toLowerCase().includes(searchLower) ||
          model.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply category/provider/tag filter
    if (selectedFilter) {
      switch (filterMode) {
        case 'category':
          filtered = getModelsByCategory(selectedFilter as ModelCategory);
          break;
        case 'provider':
          filtered = getModelsByProvider(selectedFilter);
          break;
        case 'tag':
          filtered = getModelsByTag(selectedFilter);
          break;
      }
    }

    return filtered;
  }, [searchText, filterMode, selectedFilter]);

  const renderModelItem = (model: Model) => (
    <DropdownMenuItem
      key={model.id}
      onSelect={() => {
        setOpen(false);
        startTransition(() => {
          setOptimisticModelId(model.id);
          saveModelId(model.apiIdentifier).catch(error => {
            console.error('Failed to save model ID:', error);
            setOptimisticModelId(selectedModelId);
          });
        });
      }}
      className="gap-4 p-3 group/item"
      data-active={model.apiIdentifier === optimisticModelId || model.id === optimisticModelId}
    >
      <div className="flex flex-col gap-2 flex-grow min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{model.label}</span>
          {model.provider && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                  {model.provider.name}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{model.provider.description}</p>
                {model.provider.capabilities.jsonValidation && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports JSON validation
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground line-clamp-2">
          {model.description}
        </div>

        <div className="flex flex-wrap gap-2 mt-1">
          {/* Capabilities and Tags */}
          <div className="flex gap-1">
            {model.capabilities.vision && (
              <Tooltip>
                <TooltipTrigger>
                  <span className="text-blue-500">
                    <EyeIcon size={16} />
                  </span>
                </TooltipTrigger>
                <TooltipContent>{TOOLTIP_TEXT.vision}</TooltipContent>
              </Tooltip>
            )}
            {model.capabilities.functions && (
              <Tooltip>
                <TooltipTrigger>
                  <span className="text-cyan-500">
                    <TerminalIcon size={16} />
                  </span>
                </TooltipTrigger>
                <TooltipContent>{TOOLTIP_TEXT.functions}</TooltipContent>
              </Tooltip>
            )}
            {model.tags.includes('fast') && (
              <Tooltip>
                <TooltipTrigger>
                  <span className="text-yellow-500">
                    <SparklesIcon size={16} />
                  </span>
                </TooltipTrigger>
                <TooltipContent>{TOOLTIP_TEXT.fast}</TooltipContent>
              </Tooltip>
            )}
            {model.tags.includes('reasoning') && (
              <Tooltip>
                <TooltipTrigger>
                  <span className="text-purple-500">
                    <BotIcon />
                  </span>
                </TooltipTrigger>
                <TooltipContent>{TOOLTIP_TEXT.reasoning}</TooltipContent>
              </Tooltip>
            )}
            {model.tags.includes('coding') && (
              <Tooltip>
                <TooltipTrigger>
                  <span className="text-green-500">
                    <CodeIcon size={16} />
                  </span>
                </TooltipTrigger>
                <TooltipContent>{TOOLTIP_TEXT.coding}</TooltipContent>
              </Tooltip>
            )}
            {model.tags.includes('open-source') && (
              <Tooltip>
                <TooltipTrigger>
                  <span className="text-orange-500">
                    <GlobeIcon size={16} />
                  </span>
                </TooltipTrigger>
                <TooltipContent>{TOOLTIP_TEXT['open-source']}</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
          <span>Context: {model.contextWindow.toLocaleString()} tokens</span>
          <span>
            ${model.pricing.prompt}/1K prompt, ${model.pricing.completion}/1K completion
          </span>
        </div>
      </div>

      {model.id === optimisticModelId && (
        <div className="text-foreground">
          <CheckCircleFillIcon />
        </div>
      )}
    </DropdownMenuItem>
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'flex items-center gap-2',
            'data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
            className
          )}
          disabled={isLoading}
        >
          {isLoading ? (
            'Loading models...'
          ) : selectedModel ? (
            <>
              <span className="font-medium">{selectedModel.label}</span>
              <span className="text-xs text-muted-foreground">
                ({selectedModel.provider.name})
              </span>
            </>
          ) : (
            'Select Model'
          )}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-[400px] max-h-[600px] overflow-hidden flex flex-col"
      >
        {/* Search and Filters */}
        <div className="p-2 space-y-2">
          <div className="flex items-center gap-2 px-2 py-1 border rounded-md focus-within:ring-1">
            <SearchIcon className="w-4 h-4 opacity-50" />
            <Input
              placeholder="Search models..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-8"
            />
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant={filterMode === 'category' ? 'default' : 'outline'}
              onClick={() => setFilterMode('category')}
            >
              Categories
            </Button>
            <Button
              size="sm"
              variant={filterMode === 'provider' ? 'default' : 'outline'}
              onClick={() => setFilterMode('provider')}
            >
              Providers
            </Button>
            <Button
              size="sm"
              variant={filterMode === 'tag' ? 'default' : 'outline'}
              onClick={() => setFilterMode('tag')}
            >
              Features
            </Button>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Model List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading available models...
            </div>
          ) : filterMode === 'category' ? (
            <>
              {Object.values(ModelCategory).map((category) => {
                const categoryModels = filteredModels.filter(
                  (model) => model.category === category
                );
                if (categoryModels.length === 0) return null;

                return (
                  <div key={category}>
                    <DropdownMenuLabel className="px-3 py-2">
                      {category}
                    </DropdownMenuLabel>
                    <DropdownMenuGroup>
                      {categoryModels.map(renderModelItem)}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                  </div>
                );
              })}
            </>
          ) : filterMode === 'provider' ? (
            <>
              {providers.map((provider) => {
                const providerModels = filteredModels.filter(
                  (model) => model.provider.id === provider.id
                );
                if (providerModels.length === 0) return null;

                return (
                  <div key={provider.id}>
                    <DropdownMenuLabel className="px-3 py-2">
                      {provider.name}
                    </DropdownMenuLabel>
                    <DropdownMenuGroup>
                      {providerModels.map(renderModelItem)}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                  </div>
                );
              })}
            </>
          ) : (
            <>
              {Array.from(
                new Set(models.flatMap((model) => model.tags))
              ).map((tag) => {
                const tagModels = filteredModels.filter((model) =>
                  model.tags.includes(tag)
                );
                if (tagModels.length === 0) return null;

                return (
                  <div key={tag}>
                    <DropdownMenuLabel className="px-3 py-2 flex items-center gap-2">
                      <span className="capitalize">{tag.replace(/-/g, ' ')}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuGroup>
                      {tagModels.map(renderModelItem)}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                  </div>
                );
              })}
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
