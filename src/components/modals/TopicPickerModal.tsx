import React, { useState, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { HobbyCategory } from '../../types';
import {
  getTopicsByCategory,
  getSubcategories,
  HobbyTopicItem,
} from '../../data/hobbyTopics';
import {
  Search01Icon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
} from 'hugeicons-react';

interface TopicPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: HobbyCategory;
  selectedTopic: string;
  onSelectTopic: (topicName: string) => void;
}

export const TopicPickerModal: React.FC<TopicPickerModalProps> = ({
  isOpen,
  onClose,
  category,
  selectedTopic,
  onSelectTopic,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');

  const subcategories = useMemo(() => {
    return ['all', ...getSubcategories(category)];
  }, [category]);

  const allTopics = useMemo(() => {
    return getTopicsByCategory(category);
  }, [category]);

  const filteredTopics = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allTopics.filter((t) => {
      const matchesSubcategory =
        selectedSubcategory === 'all' || t.subcategory === selectedSubcategory;
      if (!matchesSubcategory) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.subcategory.toLowerCase().includes(q) ||
        (t.shortCode && t.shortCode.toLowerCase().includes(q))
      );
    });
  }, [allTopics, selectedSubcategory, searchQuery]);

  const getModalTitle = (): string => {
    switch (category) {
      case 'football':
        return 'Select Football Club';
      case 'basketball':
        return 'Select Basketball Team';
      case 'gaming':
        return 'Select Competitive Game';
      case 'crypto':
        return 'Select Crypto Focus';
      default:
        return 'Select Topic';
    }
  };

  const getModalSubtitle = (): string => {
    switch (category) {
      case 'football':
        return 'Explore comprehensive clubs across global leagues';
      case 'basketball':
        return 'Explore NBA franchises and EuroLeague clubs';
      case 'gaming':
        return 'Explore top tier esports and tactical gaming titles';
      case 'crypto':
        return 'Explore Nimiq ecosystem, Layer 1 networks, and rollups';
      default:
        return 'Choose your active interest';
    }
  };

  const handleSelect = (topic: HobbyTopicItem) => {
    onSelectTopic(topic.name);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      maxWidth="max-w-4xl"
    >
      <div className="flex flex-col gap-5">
        <p className="text-xs text-neutral-400 font-light -mt-2">
          {getModalSubtitle()}
        </p>

        {/* Search input bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <Search01Icon size={16} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, league, or short ticker..."
            className="w-full bg-neutral-850 text-neutral-100 placeholder-neutral-500 text-xs sm:text-sm pl-10 pr-9 py-2.5 rounded-xl outline-none transition-colors focus:bg-neutral-800"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-200 cursor-pointer"
            >
              <Cancel01Icon size={14} />
            </button>
          )}
        </div>

        {/* Subcategory filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {subcategories.map((sub) => {
            const isSubSelected = selectedSubcategory === sub;
            return (
              <button
                key={sub}
                type="button"
                onClick={() => setSelectedSubcategory(sub)}
                className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                  isSubSelected
                    ? 'bg-neutral-100 text-neutral-950 font-medium'
                    : 'bg-neutral-850 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                }`}
              >
                {sub === 'all' ? 'All' : sub}
              </button>
            );
          })}
        </div>

        {/* Results count label */}
        <div className="flex items-center justify-between text-2xs text-neutral-400 uppercase tracking-wider font-medium">
          <span>
            {filteredTopics.length} {category === 'football' ? 'Clubs' : category === 'basketball' ? 'Teams' : category === 'gaming' ? 'Games' : 'Ecosystems'} Found
          </span>
          <span>Current: {selectedTopic}</span>
        </div>

        {/* Topics grid */}
        <div className="max-h-[50vh] overflow-y-auto pr-1">
          {filteredTopics.length === 0 ? (
            <div className="bg-neutral-850 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-2">
              <span className="text-xs text-neutral-300 font-light">
                No matching topics found for "{searchQuery}"
              </span>
              <span className="text-2xs text-neutral-500">
                Try searching for another keyword or selecting All leagues
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {filteredTopics.map((topic) => {
                const isSelected =
                  selectedTopic.toLowerCase() === topic.name.toLowerCase();
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => handleSelect(topic)}
                    className={`p-3 rounded-xl text-left cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-neutral-100 text-neutral-950'
                        : 'bg-neutral-850 hover:bg-neutral-800 text-neutral-200'
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs truncate ${
                            isSelected ? 'font-medium text-neutral-950' : 'font-light text-neutral-100'
                          }`}
                        >
                          {topic.name}
                        </span>
                        {topic.popular && !isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shrink-0" />
                        )}
                      </div>
                      <span
                        className={`text-2xs truncate ${
                          isSelected ? 'text-neutral-700' : 'text-neutral-400'
                        }`}
                      >
                        {topic.subcategory}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {topic.shortCode && (
                        <span
                          className={`text-2xs px-1.5 py-0.5 rounded font-mono ${
                            isSelected
                              ? 'bg-neutral-300 text-neutral-900 font-medium'
                              : 'bg-neutral-900 text-neutral-400'
                          }`}
                        >
                          {topic.shortCode}
                        </span>
                      )}
                      {isSelected && (
                        <CheckmarkCircle01Icon
                          size={15}
                          className="text-neutral-950 shrink-0"
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
