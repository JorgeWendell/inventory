"use client";
import { Search, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ServidoresSearchProps {
  onSearch: (searchTerm: string) => void;
  searchTerm: string;
}

const ServidoresSearch = ({
  onSearch,
  searchTerm,
}: ServidoresSearchProps) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  const handleSearch = (value: string) => {
    setLocalSearchTerm(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setLocalSearchTerm("");
    onSearch("");
  };

  return (
    <div className="flex w-full max-w-md items-center gap-2">
      <div className="relative flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
        <Input
          type="text"
          placeholder="Buscar por nome..."
          value={localSearchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pr-10 pl-10"
        />
        {localSearchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 transform p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ServidoresSearch;

