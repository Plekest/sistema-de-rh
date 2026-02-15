import axios from '@/services/api'
import type {
  WorkforceOverview,
  RetentionAnalysis,
  PerformanceOverview,
  TrainingOverview,
  EngagementOverview,
  CompensationAnalysis,
  PredictiveInsights,
  AnalyticsSnapshot,
} from '../types'

const BASE_URL = '/analytics'

export default {
  async getWorkforce(): Promise<WorkforceOverview> {
    const { data } = await axios.get(`${BASE_URL}/workforce`)
    return data.data
  },

  async getRetention(): Promise<RetentionAnalysis> {
    const { data } = await axios.get(`${BASE_URL}/retention`)
    return data.data
  },

  async getPerformance(): Promise<PerformanceOverview> {
    const { data } = await axios.get(`${BASE_URL}/performance`)
    return data.data
  },

  async getTraining(): Promise<TrainingOverview> {
    const { data } = await axios.get(`${BASE_URL}/training`)
    return data.data
  },

  async getEngagement(): Promise<EngagementOverview> {
    const { data } = await axios.get(`${BASE_URL}/engagement`)
    return data.data
  },

  async getCompensation(): Promise<CompensationAnalysis> {
    const { data } = await axios.get(`${BASE_URL}/compensation`)
    return data.data
  },

  async getPredictive(): Promise<PredictiveInsights> {
    const { data } = await axios.get(`${BASE_URL}/predictive`)
    return data.data
  },

  async createSnapshot(period: string): Promise<AnalyticsSnapshot> {
    const { data } = await axios.post(`${BASE_URL}/snapshot`, { period })
    return data.data
  },

  async getSnapshots(): Promise<AnalyticsSnapshot[]> {
    const { data } = await axios.get(`${BASE_URL}/snapshots`)
    return data.data
  },
}
