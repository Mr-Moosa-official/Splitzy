import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Group } from '@/app/types';
import { Users } from 'lucide-react';

interface GroupSelectorProps {
  groups: Group[];
  selectedGroupId: string;
  onGroupChange: (groupId: string) => void;
}

export function GroupSelector({ groups, selectedGroupId, onGroupChange }: GroupSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Users className="h-5 w-5 text-muted-foreground" />
      <Select value={selectedGroupId} onValueChange={onGroupChange}>
        <SelectTrigger className="w-full md:w-[280px]">
          <SelectValue placeholder="Select a group" />
        </SelectTrigger>
        <SelectContent>
          {groups.map(group => (
            <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
