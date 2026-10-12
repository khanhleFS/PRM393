import { MOCK_FILTER_REGISTRY } from './mock-data'
import type { FilterGroup } from './mock-data'

export type { FilterGroup, FilterOption } from './mock-data'

export const filterService = {
  /**
   * Unified central API to fetch filter metadata configuration for any page or scope.
   */
  getFiltersByScope: (scope: string): Promise<FilterGroup[]> => {
    return new Promise((resolve) => {
      // Mock API delay of 150ms
      setTimeout(() => {
        resolve(MOCK_FILTER_REGISTRY[scope] || [])
      }, 150)
    })
  },

  /**
   * Central API to fetch all filters in the application database registry.
   */
  getAllFilters: (): Promise<Record<string, FilterGroup[]>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_FILTER_REGISTRY)
      }, 150)
    })
  }
}
