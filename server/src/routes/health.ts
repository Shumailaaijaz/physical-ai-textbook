import express, { Request, Response } from 'express';

const router = express.Router();

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  checks: {
    memory: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      usage: number;
    };
  };
}

/**
 * Basic health check endpoint
 * Returns 200 if service is running
 */
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Detailed health check with system metrics
 * Used by monitoring tools and load balancers
 */
router.get('/detailed', (req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();
  const totalMemory = memoryUsage.heapTotal;
  const usedMemory = memoryUsage.heapUsed;
  const memoryPercentage = (usedMemory / totalMemory) * 100;

  const cpuUsage = process.cpuUsage();
  const cpuPercentage = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to seconds

  const healthCheck: HealthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      memory: {
        status: memoryPercentage > 90 ? 'unhealthy' : memoryPercentage > 75 ? 'degraded' : 'healthy',
        used: Math.round(usedMemory / 1024 / 1024), // MB
        total: Math.round(totalMemory / 1024 / 1024), // MB
        percentage: Math.round(memoryPercentage),
      },
      cpu: {
        status: cpuPercentage > 80 ? 'unhealthy' : cpuPercentage > 60 ? 'degraded' : 'healthy',
        usage: Math.round(cpuPercentage),
      },
    },
  };

  // Determine overall status
  if (healthCheck.checks.memory.status === 'unhealthy' || healthCheck.checks.cpu.status === 'unhealthy') {
    healthCheck.status = 'unhealthy';
    res.status(503);
  } else if (healthCheck.checks.memory.status === 'degraded' || healthCheck.checks.cpu.status === 'degraded') {
    healthCheck.status = 'degraded';
    res.status(200);
  } else {
    res.status(200);
  }

  res.json(healthCheck);
});

/**
 * Liveness probe endpoint
 * Returns 200 if the application is alive
 */
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Readiness probe endpoint
 * Returns 200 if the application is ready to accept traffic
 */
router.get('/ready', (req: Request, res: Response) => {
  // Add checks for database connections, external services, etc.
  const isReady = true; // Replace with actual readiness checks

  if (isReady) {
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
