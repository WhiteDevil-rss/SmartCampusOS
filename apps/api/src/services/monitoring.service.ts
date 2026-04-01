import os from 'os';
import { socketService } from './socket.service';
import { checkAiHealth } from './ai.service';

class MonitoringService {
    private requestCount = 0;
    private lastRequestCount = 0;
    private interval: NodeJS.Timeout | null = null;

    public incrementRequestCount() {
        this.requestCount++;
    }

    public async start() {
        if (this.interval) return;

        this.interval = setInterval(async () => {
            const metrics = await this.getCurrentMetrics();
            socketService.broadcastToRole('SUPERADMIN', 'system_metrics', metrics);
            // Also emit to a general 'health' room if needed
            socketService.broadcastGlobal('health_status', { 
                status: metrics.cpuUsage > 90 ? 'degraded' : 'healthy',
                timestamp: metrics.timestamp 
            });

            // Reset throughput window
            this.lastRequestCount = this.requestCount;
            this.requestCount = 0;
        }, 5000);
    }

    public async getCurrentMetrics() {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        
        // AI Service metrics
        const aiHealth = await checkAiHealth();
        
        // Approximate CPU usage from load average (1 min)
        const cpus = os.cpus().length;
        const loadAvg = os.loadavg()[0];
        const cpuUsage = Math.min(100, (loadAvg / cpus) * 100);

        return {
            cpuUsage: parseFloat(cpuUsage.toFixed(2)),
            memoryUsage: {
                total: totalMem,
                used: usedMem,
                percentage: parseFloat(((usedMem / totalMem) * 100).toFixed(2))
            },
            uptime: os.uptime(),
            throughput: this.requestCount / 5, // requests per second in this 5s window
            totalRequestsInWindow: this.requestCount,
            timestamp: new Date().toISOString(),
            ai: {
                reachable: aiHealth.reachable,
                status: aiHealth.status,
                metrics: aiHealth.metrics || null,
                version: aiHealth.version || 'unknown'
            }
        };
    }

    public stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}

export const monitoringService = new MonitoringService();
