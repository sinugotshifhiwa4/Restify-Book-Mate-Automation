export interface SanitizationParams {
  sensitiveKeys: string[];
  maskValue: string;
  enablePatternDetection: boolean;
  maxDepth: number;
}
