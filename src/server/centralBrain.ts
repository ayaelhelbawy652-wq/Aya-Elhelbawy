/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Re-exporting the 16-headed Central Brain Service from src/services/CentralBrainService.ts
export * from '../services/CentralBrainService.ts';
import { centralBrainService } from '../services/CentralBrainService.ts';

export const centralBrain = centralBrainService;
