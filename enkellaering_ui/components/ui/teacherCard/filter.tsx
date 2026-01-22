"use client";
import React, {useState} from "react";
import { Label } from "@/components/ui/label"
import { Switch } from "../switch";


import { Button } from "../button";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { CardType } from "./typesAndData";
import { cities } from "./typesAndData";
import { useMediaQuery } from "@/hooks/use-media-query";
import { AVAILABLE_SUBJECTS } from "@/constants";

export const ToggleFilterCards = ({
    passFilterDigital,
    passFilterPhysical,
    passFilterLocation,
    passFilterAvailableSubject,

  }: {
    passFilterDigital: (value: boolean) => void;
    passFilterPhysical: (value: boolean) => void;
    passFilterLocation: (value: string | null) => void;
    passFilterAvailableSubject: (value: string | null) => void;

  }) => {
    const [filterDigital, setFilterDigital] = useState<boolean>(false);
    const [filterPhysical, setFilterPhysical] = useState<boolean>(false);
  
    return (
      <div className="">

        {/*Digital and physical toggles */}
        <div className="flex flex-col items-center space-y-4">

            <div className="w-full flex flex-row space-x-8 justify-between">
                {/* Digital Filter */}
                <div className="flex items-center space-x-2">
                    <Switch
                    id="digital-filter"
                    checked={filterDigital}
                    onCheckedChange={(value) => {
                        setFilterDigital(value);
                        passFilterDigital(value);
                    }}
                    />
                    <Label htmlFor="digital-filter">Kun digital</Label>
                </div>
        
                {/* Physical Filter */}
                <div className="flex items-center space-x-2">
                    <Switch
                    id="physical-filter"
                    checked={filterPhysical}
                    onCheckedChange={(value) => {
                        setFilterPhysical(value);
                        passFilterPhysical(value);
                    }}
                    />
                    <Label htmlFor="physical-filter">Kun fysisk</Label>
                </div>
            </div>
            
            <div className="flex flex-row space-x-8">
                {/* Location Filter */}
                <div className="">
                <ComboBoxResponsive
                    values={cities}
                    placeholder="Søk etter by"
                    passSelectedValue={passFilterLocation}
                />
                </div>

                {/* Available Subject Filter */}
                <div className="">
                <ComboBoxGrouped
                    placeholder="Filter på tilgjengelige fag"
                    passSelectedValue={passFilterAvailableSubject}
                />
                </div>
            </div>

        </div>

        
      </div>
    );
};


export const filterCards = (
    cards: CardType[],
    filterLocation: string | null,
    filterAvailableSubject: string | null,
    filterDigital: boolean,
    filterPhysical: boolean
  ): CardType[] => {

    return cards.filter((card) => {
      // Check location filter
      if (filterLocation && card.teacher.location !== filterLocation) {
        return false;
      }
      // Check available subject filter
      if (filterAvailableSubject && !card.availableSubjects.includes(filterAvailableSubject)) {
        return false;
      }
      // Filter for digital tutoring
      if (filterDigital && !card.teacher.digital_tutouring) {
        return false;
      }
      // Filter for physical tutoring
      if (filterPhysical && !card.teacher.physical_tutouring) {
        return false;
      }
      // If all conditions pass, include the card
      return true;
    });
};



const ComboBoxResponsive = ({ values, placeholder, passSelectedValue }: { values: string[], placeholder: string, passSelectedValue: (value :string | null) => void }) => {
    const [open, setOpen] = useState(false);
    const isDesktop :boolean= useMediaQuery("(min-width: 768px)");
    const [selectedValue, setSelectedValue] = useState<string | null>(null);
  
    const handleSetSelectedValue = (value: string | null) => {
      setSelectedValue(value);
      setOpen(false);
      passSelectedValue(value)
    }
    if (isDesktop) {
      return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[150px] justify-start">
              {selectedValue ? selectedValue : placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <StatusList values={values} setOpen={setOpen} setSelectedValue={handleSetSelectedValue} />
          </PopoverContent>
        </Popover>
      );
    }
  
    else {
      return (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" className="w-[150px] justify-start">
              {selectedValue ? selectedValue : placeholder}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mt-4 border-t">
              <StatusList values={values} setOpen={setOpen} setSelectedValue={handleSetSelectedValue} />
            </div>
          </DrawerContent>
        </Drawer>
      );
    }
}


function StatusList({
    values,
    setOpen,
    setSelectedValue,
  }: {
    values: string[];
    setOpen: (open: boolean) => void;
    setSelectedValue: (value: string | null) => void;
  }) {
    return (
      <Command>
        <CommandInput placeholder="Filter..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
             {/* Option to clear the selection */}
            <CommandItem
                onSelect={() => {
                setSelectedValue(null);
                setOpen(false);
                }}
            >
                Fjern filter
            </CommandItem>
            {values.map((value) => (
              <CommandItem
                key={value}
                value={value}
                onSelect={() => {
                  setSelectedValue(value);
                  setOpen(false);
                }}
              >
                {value}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    );
}

// Grouped combobox for available subjects
const ComboBoxGrouped = ({ placeholder, passSelectedValue }: { placeholder: string, passSelectedValue: (value: string | null) => void }) => {
    const [open, setOpen] = useState(false);
    const isDesktop: boolean = useMediaQuery("(min-width: 768px)");
    const [selectedValue, setSelectedValue] = useState<string | null>(null);

    const handleSetSelectedValue = (value: string | null) => {
      setSelectedValue(value);
      setOpen(false);
      passSelectedValue(value);
    };

    if (isDesktop) {
      return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-start">
              {selectedValue ? selectedValue : placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0" align="start">
            <GroupedStatusList setOpen={setOpen} setSelectedValue={handleSetSelectedValue} />
          </PopoverContent>
        </Popover>
      );
    } else {
      return (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-start">
              {selectedValue ? selectedValue : placeholder}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mt-4 border-t">
              <GroupedStatusList setOpen={setOpen} setSelectedValue={handleSetSelectedValue} />
            </div>
          </DrawerContent>
        </Drawer>
      );
    }
};

function GroupedStatusList({
    setOpen,
    setSelectedValue,
  }: {
    setOpen: (open: boolean) => void;
    setSelectedValue: (value: string | null) => void;
  }) {
    return (
      <Command>
        <CommandInput placeholder="Søk fag..." />
        <CommandList>
          <CommandEmpty>Ingen fag funnet.</CommandEmpty>
          <CommandGroup>
            {/* Option to clear the selection */}
            <CommandItem
                onSelect={() => {
                  setSelectedValue(null);
                  setOpen(false);
                }}
            >
                Fjern filter
            </CommandItem>
            {/* Group by category */}
            {Object.entries(AVAILABLE_SUBJECTS).map(([category, subjects]) => (
              <div key={category}>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground capitalize">
                  {category.replace(/_/g, " ")}
                </div>
                {subjects.map((subject) => (
                  <CommandItem
                    key={subject}
                    value={subject}
                    onSelect={() => {
                      setSelectedValue(subject);
                      setOpen(false);
                    }}
                  >
                    {subject}
                  </CommandItem>
                ))}
              </div>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    );
}


