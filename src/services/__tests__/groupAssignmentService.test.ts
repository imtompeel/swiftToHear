import { GroupAssignmentService } from '../groupAssignmentService';
import { Participant, GroupConfiguration } from '../../types/groupSession';

describe('GroupAssignmentService', () => {
  const mockParticipants: Participant[] = [
    { id: '1', name: 'Alice', role: '', status: 'ready' },
    { id: '2', name: 'Bob', role: '', status: 'ready' },
    { id: '3', name: 'Charlie', role: '', status: 'ready' },
    { id: '4', name: 'Diana', role: '', status: 'ready' },
    { id: '5', name: 'Eve', role: '', status: 'ready' },
    { id: '6', name: 'Frank', role: '', status: 'ready' },
    { id: '7', name: 'Grace', role: '', status: 'ready' },
    { id: '8', name: 'Henry', role: '', status: 'ready' },
  ];

  describe('assignGroups', () => {
    it('should create single group for 4 or fewer participants', () => {
      const smallGroup = mockParticipants.slice(0, 4);
      const config: GroupConfiguration = {
        groupSize: 4,
        autoAssignRoles: true,
        groupRotation: 'balanced',
        observerStrategy: 'distribute'
      };

      const groups = GroupAssignmentService.assignGroups(smallGroup, config);

      expect(groups).toHaveLength(1);
      expect(groups[0].participants).toHaveLength(4);
      expect(groups[0].groupId).toBe('group-1');
    });

    it('should create multiple groups for 5+ participants', () => {
      const config: GroupConfiguration = {
        groupSize: 4,
        autoAssignRoles: true,
        groupRotation: 'balanced',
        observerStrategy: 'distribute'
      };

      const groups = GroupAssignmentService.assignGroups(mockParticipants, config);

      expect(groups.length).toBeGreaterThan(1);
      expect(groups[0].participants).toHaveLength(4);
      expect(groups[1].participants).toHaveLength(4);
    });

    it('should respect group size preference of 3', () => {
      const config: GroupConfiguration = {
        groupSize: 3,
        autoAssignRoles: true,
        groupRotation: 'balanced',
        observerStrategy: 'distribute'
      };

      const groups = GroupAssignmentService.assignGroups(mockParticipants, config);

      // Should create groups of 3 people each
      groups.forEach(group => {
        expect(group.participants.length).toBeLessThanOrEqual(3);
        expect(group.participants.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should auto-assign roles when enabled', () => {
      const config: GroupConfiguration = {
        groupSize: 4,
        autoAssignRoles: true,
        groupRotation: 'balanced',
        observerStrategy: 'distribute'
      };

      const groups = GroupAssignmentService.assignGroups(mockParticipants, config);

      // Check that roles are assigned
      groups.forEach(group => {
        const roles = group.participants.map(p => p.role);
        expect(roles.every(role => role !== '')).toBe(true);
      });
    });

    it('should not auto-assign roles when disabled', () => {
      // Create participants with empty roles
      const participantsWithEmptyRoles = mockParticipants.map(p => ({ ...p, role: '' }));
      
      const config: GroupConfiguration = {
        groupSize: 4,
        autoAssignRoles: false,
        groupRotation: 'balanced',
        observerStrategy: 'distribute'
      };

      const groups = GroupAssignmentService.assignGroups(participantsWithEmptyRoles, config);

      // Check that roles are not assigned
      groups.forEach(group => {
        const roles = group.participants.map(p => p.role);
        expect(roles.every(role => role === '')).toBe(true);
      });
    });
  });

  describe('validateConfiguration', () => {
    it('should validate correct configuration', () => {
      const config: GroupConfiguration = {
        groupSize: 4,
        autoAssignRoles: true,
        groupRotation: 'balanced',
        observerStrategy: 'distribute'
      };

      const result = GroupAssignmentService.validateConfiguration(8, config);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject configuration with too few participants', () => {
      const config: GroupConfiguration = {
        groupSize: 4,
        autoAssignRoles: true,
        groupRotation: 'balanced',
        observerStrategy: 'distribute'
      };

      const result = GroupAssignmentService.validateConfiguration(2, config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Minimum 3 participants required for group sessions');
    });

    it('should reject invalid maxGroups', () => {
      const config: GroupConfiguration = {
        groupSize: 4,
        autoAssignRoles: true,
        groupRotation: 'balanced',
        observerStrategy: 'distribute',
        maxGroups: 0
      };

      const result = GroupAssignmentService.validateConfiguration(8, config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Maximum groups must be at least 1');
    });
  });

  describe('balanceRoles', () => {
    it('should balance roles across groups', () => {
      const groups = [
        {
          groupId: 'group-1',
          participants: [
            { id: '1', name: 'Alice', role: 'speaker', status: 'ready' },
            { id: '2', name: 'Bob', role: 'speaker', status: 'ready' },
            { id: '3', name: 'Charlie', role: 'speaker', status: 'ready' },
            { id: '4', name: 'Diana', role: 'speaker', status: 'ready' }
          ],
          status: 'waiting' as const,
          currentPhase: 'waiting',
          roundNumber: 1,
          scribeNotes: {}
        }
      ];

      const balancedGroups = GroupAssignmentService.balanceRoles(groups);

      const roles = balancedGroups[0].participants.map(p => p.role);
      expect(roles).toContain('speaker');
      expect(roles).toContain('listener');
      expect(roles).toContain('scribe');
      expect(roles).toContain('observer');
    });
  });

  describe('shuffleGroups', () => {
    it('should shuffle participants while maintaining group sizes', () => {
      const groups = [
        {
          groupId: 'group-1',
          participants: [
            { id: '1', name: 'Alice', role: 'speaker', status: 'ready' },
            { id: '2', name: 'Bob', role: 'listener', status: 'ready' }
          ],
          status: 'waiting' as const,
          currentPhase: 'waiting',
          roundNumber: 1,
          scribeNotes: {}
        },
        {
          groupId: 'group-2',
          participants: [
            { id: '3', name: 'Charlie', role: 'scribe', status: 'ready' },
            { id: '4', name: 'Diana', role: 'observer', status: 'ready' }
          ],
          status: 'waiting' as const,
          currentPhase: 'waiting',
          roundNumber: 1,
          scribeNotes: {}
        }
      ];

      const shuffledGroups = GroupAssignmentService.shuffleGroups(groups);

      // Group sizes should be maintained
      expect(shuffledGroups[0].participants).toHaveLength(2);
      expect(shuffledGroups[1].participants).toHaveLength(2);

      // All participants should still be present
      const allParticipantIds = shuffledGroups.flatMap(g => g.participants.map(p => p.id));
      expect(allParticipantIds).toContain('1');
      expect(allParticipantIds).toContain('2');
      expect(allParticipantIds).toContain('3');
      expect(allParticipantIds).toContain('4');
    });
  });
});
