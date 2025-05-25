import { z } from 'zod';

// Configuration schema with validation
const ConfigSchema = z.object({
  smpApiBaseUrl: z.string().url().default('https://api.amexgbt.com'),
  smpCompanyId: z.string().default('5281df97-5579-4ea5-a6ce-620f546b6d8b'),
  smpGdsCode: z.string().default('DUMMY'),
  smpOfficeId: z.string().default('TEST'),
  smpMode: z.enum(['fake', 'real']).default('fake'),
  echoToken: z.string().optional(),
});

export type Config = z.infer<typeof ConfigSchema>;

// Load and validate configuration from environment variables
function loadConfig(): Config {
  const rawConfig = {
    smpApiBaseUrl: process.env.SMP_API_BASE_URL,
    smpCompanyId: process.env.SMP_COMPANY_ID,
    smpGdsCode: process.env.SMP_GDS_CODE,
    smpOfficeId: process.env.SMP_OFFICE_ID,
    smpMode: process.env.SMP_MODE,
    echoToken: process.env.SMP_ECHO_TOKEN,
  };

  try {
    return ConfigSchema.parse(rawConfig);
  } catch (error) {
    console.error('Configuration validation failed:', error);
    throw new Error('Invalid configuration. Please check your environment variables.');
  }
}

// Export singleton config instance
export const config = loadConfig();

// Helper function to generate echo token if not provided
export function getEchoToken(): string {
  return config.echoToken || `mcp-smp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
} 