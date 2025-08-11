import { Participant, GroupData, GroupConfiguration } from '../types/groupSession';

export class GroupAssignmentService {
  /**
   * Assign participants to groups based on configuration
   */
  static assignGroups(
    participants: Participant[], 
    config: GroupConfiguration,
    fivePersonChoice?: 'split' | 'together'
  ): GroupData[] {
    console.log('GroupAssignmentService.assignGroups called with:', { participants: participants.length, config, fivePersonChoice });
    
    // Handle edge cases
    if (participants.length === 1) {
      throw new Error('Cannot create session with only 1 participant');
    }
    
    if (participants.length === 2) {
      // 2 people: Speaker & Listener only (no Scribe)
      console.log('Creating 2-person group (Speaker & Listener only)');
      return [this.createTwoPersonGroup(participants, 'group-1')];
    }
    
    if (participants.length <= 4) {
      // 3-4 people: Single group with Speaker, Listener & Scribe
      console.log('Creating single group for 3-4 participants');
      return [this.createSingleGroup(participants, 'group-1', config.autoAssignRoles)];
    }
    
    if (participants.length === 5) {
      // 5 people: Handle based on choice
      if (fivePersonChoice === 'split') {
        console.log('Creating 2+3 split for 5 participants');
        return this.createFivePersonSplit(participants);
      } else if (fivePersonChoice === 'together') {
        console.log('Creating 5-person group with 2 observers');
        return [this.createFivePersonTogether(participants, 'group-1')];
      } else {
        // Default to split if no choice provided
        console.log('Defaulting to 2+3 split for 5 participants');
        return this.createFivePersonSplit(participants);
      }
    }

    // Determine optimal group sizes
    const groupSizes = this.calculateGroupSizes(participants.length, config.groupSize);
    console.log('Calculated group sizes:', groupSizes);
    
    // Create groups
    const groups: GroupData[] = [];
    let participantIndex = 0;

    groupSizes.forEach((size, index) => {
      const groupParticipants = participants.slice(participantIndex, participantIndex + size);
      const groupId = `group-${index + 1}`;
      
      console.log(`Creating Group ${groupId}: ${groupParticipants.length} participants (${groupParticipants.map(p => p.name).join(', ')})`);
      
      groups.push(this.createSingleGroup(groupParticipants, groupId, config.autoAssignRoles));
      participantIndex += size;
    });

    // Apply role distribution and observer strategy if auto-assign is enabled
    if (config.autoAssignRoles) {
      this.distributeRoles(groups, config);
      this.distributeObservers(groups, config.observerStrategy);
    }

    console.log(`📊 Group Distribution Summary: ${participants.length} participants → ${groups.length} groups`);
    groups.forEach((group, index) => {
      console.log(`  Group ${index + 1}: ${group.participants.length} participants`);
    });

    return groups;
  }

  /**
   * Calculate optimal group sizes based on participant count and configuration
   * Ensures all groups are either 3 or 4 participants
   */
  private static calculateGroupSizes(
    participantCount: number, 
    preferredSize?: 3 | 4 | 'mixed'
  ): number[] {
    const groups: number[] = [];
    let remaining = participantCount;
    if (preferredSize === 3) {
      // Prefer groups of 3
      while (remaining >= 3) {
        groups.push(3);
        remaining -= 3;
      }
      
      // If we have 1 or 2 left, redistribute
      if (remaining === 1 || remaining === 2) {
        if (groups.length > 0) {
          // For 8 participants: we have [3, 3] and 2 remaining
          // We should create [3, 3, 2] not [4, 4]
          // So we should just add the remaining as a new group
          groups.push(remaining);
          remaining = 0;
        }
      }
    } else if (preferredSize === 4) {
      // Prefer groups of 4
      while (remaining >= 4) {
        groups.push(4);
        remaining -= 4;
      }
      
      // If we have 3 left, create a group of 3
      if (remaining === 3) {
        groups.push(3);
        remaining = 0;
      }
      
      // If we have 1 or 2 left, redistribute
      if (remaining === 1 || remaining === 2) {
        if (groups.length > 0 && groups[groups.length - 1] === 4) {
          groups[groups.length - 1] = 3;
          remaining += 1;
          
          if (remaining === 3) {
            groups.push(3);
          } else if (remaining === 2) {
            if (groups.length > 1 && groups[groups.length - 2] === 4) {
              groups[groups.length - 2] = 3;
              remaining += 1;
              groups.push(3);
            }
          }
        }
      }
    } else {
      // Mixed preference (default) - balance between 3 and 4
      while (remaining >= 4) {
        groups.push(4);
        remaining -= 4;
      }
      
      if (remaining === 3) {
        groups.push(3);
        remaining = 0;
      }
      
      if (remaining === 1 || remaining === 2) {
        if (groups.length > 0 && groups[groups.length - 1] === 4) {
          groups[groups.length - 1] = 3;
          remaining += 1;
          
          if (remaining === 3) {
            groups.push(3);
          } else if (remaining === 2) {
            if (groups.length > 1 && groups[groups.length - 2] === 4) {
              groups[groups.length - 2] = 3;
              remaining += 1;
              groups.push(3);
            }
          }
        }
      }
    }
    
    console.log(`📊 Group size calculation: ${participantCount} participants → [${groups.join(', ')}]`);
    return groups;
  }

  /**
   * Create a single group with basic structure and role assignment
   */
  private static createSingleGroup(participants: Participant[], groupId: string, autoAssignRoles: boolean = true): GroupData {
    return {
      groupId,
      participants: autoAssignRoles 
        ? participants.map((p, index) => ({
            ...p,
            role: this.assignRole(index, participants.length)
          }))
        : [...participants], // Keep original roles if auto-assign is disabled
      status: 'waiting',
      currentPhase: 'waiting',
      roundNumber: 1,
      scribeNotes: {}
    };
  }

  /**
   * Create a two-person group (Speaker & Listener only, no Scribe)
   */
  private static createTwoPersonGroup(participants: Participant[], groupId: string): GroupData {
    return {
      groupId,
      participants: participants.map((p, index) => ({
        ...p,
        role: index === 0 ? 'speaker' : 'listener'
      })),
      status: 'waiting',
      currentPhase: 'waiting',
      roundNumber: 1,
      scribeNotes: {}
    };
  }

  /**
   * Create 2+3 split for 5 participants
   */
  private static createFivePersonSplit(participants: Participant[]): GroupData[] {
    const group1 = this.createSingleGroup(participants.slice(0, 2), 'group-1', true);
    const group2 = this.createSingleGroup(participants.slice(2, 5), 'group-2', true);
    return [group1, group2];
  }

  /**
   * Create 5-person group with 2 observers
   */
  private static createFivePersonTogether(participants: Participant[], groupId: string): GroupData {
    return {
      groupId,
      participants: participants.map((p, index) => ({
        ...p,
        role: index < 3 ? this.assignRole(index, 3) : 'observer' // First 3 get active roles, last 2 are observers
      })),
      status: 'waiting',
      currentPhase: 'waiting',
      roundNumber: 1,
      scribeNotes: {}
    };
  }

  /**
   * Assign a role based on index and participant count
   */
  private static assignRole(index: number, participantCount: number): string {
    if (participantCount === 2) {
      return index === 0 ? 'speaker' : 'listener';
    }
    
    if (participantCount === 3) {
      const roles = ['speaker', 'listener', 'scribe'];
      return roles[index % roles.length];
    }
    
    if (participantCount === 4) {
      const roles = ['speaker', 'listener', 'scribe', 'observer'];
      return roles[index % roles.length];
    }
    
    // For larger groups, cycle through the basic roles
    const roles = ['speaker', 'listener', 'scribe'];
    return roles[index % roles.length];
  }

  /**
   * Distribute roles across groups to ensure balance
   */
  private static distributeRoles(groups: GroupData[], _config: GroupConfiguration): void {
    const roleOrder = ['speaker', 'listener', 'scribe', 'observer'];
    
    groups.forEach((group, groupIndex) => {
      group.participants.forEach((participant, participantIndex) => {
        // Assign roles in rotation to ensure balance
        const roleIndex = (groupIndex + participantIndex) % roleOrder.length;
        participant.role = roleOrder[roleIndex];
      });
    });
  }

  /**
   * Distribute observers based on strategy
   */
  private static distributeObservers(
    groups: GroupData[], 
    strategy: 'distribute' | 'central'
  ): void {
    if (strategy === 'distribute') {
      // Distribute observers across all groups
      // This is handled by the role distribution above
      return;
    } else if (strategy === 'central') {
      // Put all observers in the first group
      const firstGroup = groups[0];
      if (firstGroup) {
        firstGroup.participants.forEach(participant => {
          if (participant.role === 'observer') {
            // Keep as observer
          } else {
            // Reassign other participants to different roles
            const otherRoles = ['speaker', 'listener', 'scribe'];
            const roleIndex = firstGroup.participants.indexOf(participant) % otherRoles.length;
            participant.role = otherRoles[roleIndex];
          }
        });
      }
    }
  }

  /**
   * Balance roles across groups to ensure each group has the necessary roles
   */
  static balanceRoles(groups: GroupData[]): GroupData[] {
    const roleOrder = ['speaker', 'listener', 'scribe', 'observer'];
    
    groups.forEach(group => {
      const currentRoles = group.participants.map(p => p.role);
      const missingRoles = roleOrder.filter(role => !currentRoles.includes(role));
      
      // If we have missing roles and extra participants, reassign
      if (missingRoles.length > 0 && group.participants.length >= 4) {
        missingRoles.forEach((role, index) => {
          if (index < group.participants.length) {
            group.participants[index].role = role;
          }
        });
      }
    });

    return groups;
  }

  /**
   * Shuffle participants across groups while maintaining group sizes
   */
  static shuffleGroups(groups: GroupData[]): GroupData[] {
    // Collect all participants
    const allParticipants: Participant[] = [];
    groups.forEach(group => {
      allParticipants.push(...group.participants);
    });

    // Shuffle all participants
    const shuffled = this.shuffleArray([...allParticipants]);

    // Redistribute back to groups
    let participantIndex = 0;
    groups.forEach(group => {
      const groupSize = group.participants.length;
      group.participants = shuffled.slice(participantIndex, participantIndex + groupSize);
      participantIndex += groupSize;
    });

    return groups;
  }

  /**
   * Utility function to shuffle an array
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Validate group configuration
   */
  static validateConfiguration(
    participantCount: number, 
    config: GroupConfiguration
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (participantCount < 3) {
      errors.push('Minimum 3 participants required for group sessions');
    }

    if (config.maxGroups !== undefined && config.maxGroups < 1) {
      errors.push('Maximum groups must be at least 1');
    }

    if (config.groupSize === 3 && participantCount < 3) {
      errors.push('At least 3 participants required for groups of 3');
    }

    if (config.groupSize === 4 && participantCount < 4) {
      errors.push('At least 4 participants required for groups of 4');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
