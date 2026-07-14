import type { WorkspaceModuleId } from '@/lib/workspace';

export type CanvasModuleId = WorkspaceModuleId | `note-${number}`;
export type WorkspaceTool = 'select' | 'fit' | 'route' | 'network';
export type WorkspaceModuleKind =
  | 'network'
  | 'liquidity'
  | 'route'
  | 'rebalance'
  | 'channels'
  | 'alerts'
  | 'audit'
  | 'note';

export interface WorkspaceModule {
  id: CanvasModuleId;
  title: string;
  eyebrow: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  kind: WorkspaceModuleKind;
  collapsed?: boolean;
}
