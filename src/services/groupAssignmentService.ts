import { Participant, GroupData, GroupConfiguration } from '../types/groupSession';

export class GroupAssignmentService {
  /**
   * Assign participants to groups based on configuration
   */
  static assignGroups(
    participants: Participant[], 
    config: GroupConfiguration
  ): GroupData[] {
    console.log('GroupAssignmentService.assignGroups called with:', { participants: participants.length, config });
    
    if (participants.length <= 4) {
      // For small groups, create a single group
      console.log('Creating single group for small participant count');
      return [this.createSingleGroup(participants, 'group-1')];
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
      
      groups.push(this.createSingleGroup(groupParticipants, groupId));
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
    preferredSize: 3 | 4 | 'mixed'
  ): number[] {
    const groups: number[] = [];
    
    // For all preference types, use the same algorithm that ensures groups of 3-4 only
    let remaining = participantCount;
    
    // First, create as many groups of 4 as possible
    while (remaining >= 4) {
      groups.push(4);
      remaining -= 4;
    }
    
    // If we have 3 left, create a group of 3
    if (remaining === 3) {
      groups.push(3);
      remaining = 0;
    }
    
    // If we have 1 or 2 left, we need to redistribute
    if (remaining === 1 || remaining === 2) {
      // Remove one group of 4 and create groups of 3 instead
      if (groups.length > 0 && groups[groups.length - 1] === 4) {
        groups[groups.length - 1] = 3; // Change last group from 4 to 3
        remaining += 1; // Now we have 2 or 3 remaining
        
        if (remaining === 3) {
          groups.push(3);
        } else if (remaining === 2) {
          // We have 2 remaining, so we need to redistribute again
          // Remove another group of 4 and create groups of 3
          if (groups.length > 1 && groups[groups.length - 2] === 4) {
            groups[groups.length - 2] = 3; // Change second-to-last group from 4 to 3
            remaining += 1; // Now we have 3 remaining
            groups.push(3);
          } else {
            // If we can't find another group of 4, distribute the 2 to existing groups
            // But ensure no group exceeds 4
            for (let i = 0; i < remaining; i++) {
              if (groups[i] < 4) {
                groups[i]++;
              }
            }
          }
        }
      } else {
        // If we don't have any groups of 4, distribute the remaining 1-2 to existing groups
        // But ensure no group exceeds 4
        for (let i = 0; i < remaining; i++) {
          if (groups[i] < 4) {
            groups[i]++;
          }
        }
      }
    }
    
    console.log(`📊 Group size calculation: ${participantCount} participants → [${groups.join(', ')}]`);
    return groups;
  }

  /**
   * Create a single group with basic structure
   */
  private static createSingleGroup(participants: Participant[], groupId: string): GroupData {
    return {
      groupId,
      participants: [...participants],
      status: 'waiting',
      currentPhase: 'waiting',
      roundNumber: 1,
      scribeNotes: {}
    };
  }

  /**
   * Distribute roles across groups to ensure balance
   */
  private static distributeRoles(groups: GroupData[], config: GroupConfiguration): void {
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
