"use client";

import React, { useEffect, useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Package,
  Truck,
  ShoppingCart,
  TrendingDown,
  AlertTriangle,
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Terminal,
  Zap,
  Info,
  MailOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { inventoryService } from '@/lib/services/inventory';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';

export default function InventoryPage() {
  const { user } = useAuthStore();
  const universityId = user?.universityId || '';

  const [items, setItems] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('stock');

  // New Item Dialog State
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    description: '',
    stockLevel: 0,
    minThreshold: 10,
    unit: 'Units',
    sku: ''
  });

  // Adjust Stock Dialog State
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustData, setAdjustData] = useState({
    itemId: '',
    quantity: 0,
    type: 'IN' as 'IN' | 'OUT',
    reason: ''
  });

  const fetchData = async () => {
    if (!universityId) return;
    try {
      const [itemsData, vendorsData, requestsData, forecastData] = await Promise.all([
        inventoryService.getItems(universityId),
        inventoryService.getVendors(universityId),
        inventoryService.getProcurementRequests(universityId),
        inventoryService.getForecast(universityId).catch(err => {
          console.error("AI Forecast failed:", err);
          return null;
        })
      ]);
      setItems(itemsData);
      setVendors(vendorsData);
      setRequests(requestsData);
      setForecast(forecastData);
    } catch (error) {
      console.error("Failed to fetch inventory data:", error);
      toast.error("Could not sync inventory systems.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [universityId]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const handleCreateItem = async () => {
    try {
      await inventoryService.createItem(universityId, newItem);
      toast.success("Inventory asset registered successfully.");
      setIsNewItemOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to register asset.");
    }
  };

  const handleAdjustStock = async () => {
    try {
      await inventoryService.adjustStock(adjustData.itemId, {
        quantity: adjustData.quantity,
        type: adjustData.type,
        reason: adjustData.reason
      });
      toast.success("Stock level re-aligned.");
      setIsAdjustOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Stock adjustment failed.");
    }
  };

  const updateRequestStatus = async (id: string, status: string) => {
    try {
      await inventoryService.updateProcurementStatus(id, status);
      toast.success(`Procurement batch ${status.toLowerCase()}.`);
      fetchData();
    } catch (error) {
      toast.error("Failed to update procurement chain.");
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  // Risk levels mapping for UI
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'HIGH': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'MEDIUM': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 bg-[#020817] min-h-screen pt-24 lg:pt-14 overflow-hidden">
        <div className="flex justify-between items-center">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64 bg-slate-800" />
            <Skeleton className="h-4 w-96 bg-slate-800" />
          </div>
          <Skeleton className="h-10 w-32 bg-slate-800" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 bg-slate-800 rounded-3xl" />)}
        </div>
        <Skeleton className="h-96 w-full bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  const criticalIssues = items.filter(i => i.stockLevel < i.minThreshold).length;

  return (
    <div className="p-8 pb-32 space-y-8 bg-[#020817] min-h-screen pt-24 lg:pt-14 max-w-[1600px] mx-auto select-none">

      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20">
              <Package className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-black text-slate-100 tracking-tightest uppercase font-space-grotesk italic">Smart <span className="text-primary not-italic">Inventory</span></h1>
          </div>
          <p className="text-slate-400 font-medium max-w-xl">
            Enterprise asset management powered by predictive supply-chain intelligence.
          </p>
        </motion.div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-100 transition-all rounded-2xl"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Sync Systems
          </Button>
          <Button
            onClick={() => setIsNewItemOpen(true)}
            className="bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/25 rounded-2xl font-black uppercase tracking-widest text-xs px-6"
          >
            <Plus className="h-4 w-4 mr-2" />
            Register Asset
          </Button>
        </div>
      </div>

      {/* Intelligence Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="bg-[#0a1120] border-white/5 shadow-2xl relative overflow-hidden group rounded-3xl">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
              <Package className="h-24 w-24 text-primary" />
            </div>
            <CardHeader>
              <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-widest font-space-grotesk">Total Assets</CardTitle>
              <div className="text-4xl font-black text-white mt-1">{items.length}</div>
            </CardHeader>
            <CardFooter className="text-xs font-black text-slate-500">
              <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-1" />
              <span className="text-emerald-500">Active</span> in campus catalog
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-[#0a1120] border-white/5 shadow-2xl relative overflow-hidden group rounded-3xl">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
              <AlertTriangle className="h-24 w-24 text-rose-500" />
            </div>
            <CardHeader>
              <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-widest font-space-grotesk">Critical Stock</CardTitle>
              <div className="text-4xl font-black text-white mt-1">{criticalIssues}</div>
            </CardHeader>
            <CardFooter className="text-xs font-black text-slate-500">
              <TrendingDown className="h-4 w-4 text-rose-500 mr-1" />
              <span className="text-rose-500">Below</span> min. threshold
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-[#0a1120] border-white/5 shadow-2xl relative overflow-hidden group rounded-3xl">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
              <Truck className="h-24 w-24 text-blue-500" />
            </div>
            <CardHeader>
              <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-widest font-space-grotesk">Active Vendors</CardTitle>
              <div className="text-4xl font-black text-white mt-1">{vendors.length}</div>
            </CardHeader>
            <CardFooter className="text-xs font-black text-slate-500">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-1" />
              Verified supply chain
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-primary/5 border-primary/20 shadow-2xl relative overflow-hidden group rounded-3xl">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
              <Zap className="h-24 w-24 text-primary" />
            </div>
            <CardHeader>
              <CardTitle className="text-sm font-black text-primary uppercase tracking-widest font-space-grotesk">Pending Ops</CardTitle>
              <div className="text-4xl font-black text-white mt-1">{requests.filter(r => r.status === 'PENDING').length}</div>
            </CardHeader>
            <CardFooter className="text-xs font-black text-primary/70">
              <Clock className="h-4 w-4 text-primary mr-1" />
              Awaiting authorization
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <Tabs defaultValue="stock" onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <TabsList className="bg-white/5 border border-white/10 p-1.5 h-14 rounded-2xl w-fit">
            <TabsTrigger value="stock" className="data-[state=active]:bg-primary data-[state=active]:text-white h-11 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest">Stock Catalog</TabsTrigger>
            <TabsTrigger value="forecast" className="data-[state=active]:bg-primary data-[state=active]:text-white h-11 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest">AI Forecasting</TabsTrigger>
            <TabsTrigger value="procurement" className="data-[state=active]:bg-primary data-[state=active]:text-white h-11 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest">Supply Chain</TabsTrigger>
            <TabsTrigger value="vendors" className="data-[state=active]:bg-primary data-[state=active]:text-white h-11 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest">Vendor Hub</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 bg-white/5 border-white/5 text-slate-200 focus:bg-white/10 focus:border-primary/50 transition-all rounded-2xl h-12"
              />
            </div>
            <Button variant="outline" className="bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 rounded-2xl h-12 w-12 p-0">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 rounded-2xl h-12 w-12 p-0">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <TabsContent value="stock" className="m-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-[#0a1120] border-white/5 overflow-hidden rounded-3xl">
                <Table>
                  <TableHeader className="bg-white/[0.02] border-b border-white/5">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="text-slate-500 font-bold uppercase tracking-widest text-[10px] py-6 px-8">Resource Identity</TableHead>
                      <TableHead className="text-slate-500 font-bold uppercase tracking-widest text-[10px] py-6">Classification</TableHead>
                      <TableHead className="text-slate-500 font-bold uppercase tracking-widest text-[10px] py-6">Current Stock</TableHead>
                      <TableHead className="text-slate-500 font-bold uppercase tracking-widest text-[10px] py-6">Operational Status</TableHead>
                      <TableHead className="text-right text-slate-500 font-bold uppercase tracking-widest text-[10px] py-6 px-8">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                        <TableCell className="py-6 px-8">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform",
                              item.stockLevel < item.minThreshold ? "bg-rose-500/10" : "bg-slate-800"
                            )}>
                              <Package className={cn("h-6 w-6", item.stockLevel < item.minThreshold ? "text-rose-500" : "text-slate-400")} />
                            </div>
                            <div>
                              <p className="font-black text-slate-100 uppercase tracking-tighter group-hover:text-primary transition-colors">{item.name}</p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">SKU: {item.sku || 'N/A'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-slate-800 text-slate-300 border-white/5 hover:bg-slate-700 font-bold uppercase text-[9px] tracking-widest px-2.5 py-1">
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2 max-w-[120px]">
                            <div className="flex justify-between items-end">
                              <p className="text-xl font-black text-white">{item.stockLevel} <span className="text-[10px] text-slate-500 uppercase">{item.unit}</span></p>
                            </div>
                            <Progress
                              value={Math.min(100, (item.stockLevel / (item.minThreshold * 2)) * 100)}
                              className={cn(
                                "h-1.5",
                                item.stockLevel < item.minThreshold ? "text-rose-500" : "text-primary"
                              )}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.stockLevel < item.minThreshold ? (
                            <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 font-black uppercase text-[9px] tracking-tighter ring-1 ring-rose-500/30">Depleted</Badge>
                          ) : (
                            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black uppercase text-[9px] tracking-tighter ring-1 ring-emerald-500/30">In Stock</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right px-8">
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => {
                                setAdjustData({ ...adjustData, itemId: item.id });
                                setIsAdjustOpen(true);
                              }}
                              variant="ghost"
                              className="h-10 w-10 p-0 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-10 w-10 p-0 text-slate-500 hover:text-slate-100 rounded-xl">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-[#0a1120] border-white/10 w-48 p-2 rounded-2xl bg-opacity-95 backdrop-blur-xl">
                                <DropdownMenuItem className="rounded-xl focus:bg-primary/10 focus:text-primary py-2.5 font-bold uppercase text-[10px] tracking-widest cursor-pointer">Edit Identity</DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl focus:bg-primary/10 focus:text-primary py-2.5 font-bold uppercase text-[10px] tracking-widest cursor-pointer">Usage Analytics</DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/5" />
                                <DropdownMenuItem className="rounded-xl focus:bg-rose-500/10 focus:text-rose-500 py-2.5 font-bold uppercase text-[10px] tracking-widest cursor-pointer">Decommission Asset</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="forecast" className="m-0">
            {forecast ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="md:col-span-2 bg-[#0a1120] border-white/5 rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Zap className="h-32 w-32 text-primary" />
                    </div>
                    <div className="relative z-10 space-y-6">
                      <div className="space-y-2">
                        <Badge className="bg-primary/10 text-primary border-primary/20 font-black uppercase text-[10px] tracking-widest mb-2 px-3 py-1">AI Recommendation Engine</Badge>
                        <h2 className="text-3xl font-black text-white tracking-tight uppercase font-space-grotesk">{forecast.criticalSummary || "Inventory Optimized"}</h2>
                        <p className="text-slate-400 font-medium max-w-xl italic">
                          Synthesizing historical usage patterns and vendor lead times to predict future resource requirements.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-[#0a1120] border-white/5 border-l-4 border-l-primary rounded-3xl p-8">
                    <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6 block">Supply-Chain Health</CardTitle>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin-slow flex items-center justify-center p-1">
                        <div className="h-full w-full rounded-full bg-primary/20 flex items-center justify-center">
                          <TrendingDown className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div>
                        <p className="text-2xl font-black text-white tracking-tighter uppercase font-space-grotesk">Stable</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Internal Logistics</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      Current consumption rates indicate no major disruptions for the next 14 operational days.
                    </p>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {forecast.forecasts.map((f: any) => (
                    <Card key={f.itemId} className="bg-[#0a1120] border-white/5 rounded-3xl overflow-hidden group hover:border-primary/30 transition-all shadow-xl">
                      <div className={cn("h-2 w-full",
                        f.riskLevel === 'CRITICAL' ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]' :
                          f.riskLevel === 'HIGH' ? 'bg-orange-500' : 'bg-emerald-500'
                      )} />
                      <CardHeader>
                        <div className="flex justify-between items-start mb-4">
                          <Badge className={cn("font-black uppercase text-[9px] tracking-widest px-2 py-1 border", getRiskColor(f.riskLevel))}>
                            {f.riskLevel}
                          </Badge>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1 text-primary" />
                            -{f.daysUntilDepletion} Days
                          </span>
                        </div>
                        <CardTitle className="text-xl font-black text-slate-100 uppercase tracking-tighter group-hover:text-primary transition-colors">{f.itemName}</CardTitle>
                        <CardDescription className="text-xs font-medium text-slate-400">Predicted depletion: {format(new Date(f.depletionDate), 'MMM dd, yyyy')}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-white/5 rounded-2xl p-4 space-y-4">
                          <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                            <span>Recommended Refill</span>
                            <span className="text-slate-100 font-black">{f.recommendedOrderQty} Units</span>
                          </div>
                          <Progress value={Math.max(10, (1 - (f.daysUntilDepletion / 30)) * 100)} className="h-1.5" />
                          <div className="flex items-start gap-2 bg-primary/5 p-3 rounded-xl border border-primary/10">
                            <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                            <p className="text-[10px] text-slate-300 font-medium leading-relaxed">{f.reasoning}</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl h-11 font-black uppercase text-[10px] tracking-widest">Initialize Procurement</Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </motion.div>
            ) : (
              <Card className="bg-[#0a1120] border-white/5 p-20 rounded-3xl text-center">
                <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <TrendingDown className="h-10 w-10 text-primary animate-bounce-slow" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Insufficient Signal</h3>
                <p className="text-slate-400 max-w-md mx-auto font-medium">History usage data is required to generate predictive forecasts. Start logging inventory adjustments to initialize the AI engine.</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="procurement" className="m-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-[#0a1120] border-white/5 overflow-hidden rounded-3xl">
                <Table>
                  <TableHeader className="bg-white/[0.02] border-b border-white/5">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="text-slate-500 font-bold uppercase tracking-widest text-[10px] py-6 px-8">Batch ID</TableHead>
                      <TableHead className="text-slate-500 font-bold uppercase tracking-widest text-[10px] py-6">Target Resource</TableHead>
                      <TableHead className="text-slate-500 font-bold uppercase tracking-widest text-[10px] py-6">Vendor Entity</TableHead>
                      <TableHead className="text-slate-500 font-bold uppercase tracking-widest text-[10px] py-6">Flow Status</TableHead>
                      <TableHead className="text-right text-slate-500 font-bold uppercase tracking-widest text-[10px] py-6 px-8">Approvals</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((req: any) => (
                      <TableRow key={req.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                        <TableCell className="py-6 px-8">
                          <p className="font-black text-slate-100 uppercase tracking-tighter">REQ-{req.id.slice(-6).toUpperCase()}</p>
                          <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mt-0.5">{format(new Date(req.createdAt), 'MMM dd')}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center">
                              <Plus className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-200 uppercase tracking-tighter">{req.item.name}</p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase">{req.quantity} {req.item.unit}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-black text-slate-200 uppercase tracking-tighter italic">{req.vendor.name}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("font-black uppercase text-[9px] tracking-widest px-2.5 py-1 ring-1",
                            req.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 ring-yellow-500/20' :
                              req.status === 'APPROVED' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 ring-blue-500/20' :
                                req.status === 'RECEIVED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 ring-emerald-500/20' :
                                  'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          )}>
                            {req.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right px-8">
                          <div className="flex justify-end gap-2">
                            {req.status === 'PENDING' && (
                              <>
                                <Button
                                  onClick={() => updateRequestStatus(req.id, 'APPROVED')}
                                  size="sm"
                                  className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest h-9"
                                >Authorize</Button>
                                <Button
                                  onClick={() => updateRequestStatus(req.id, 'REJECTED')}
                                  size="sm"
                                  className="bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest h-9"
                                >Reject</Button>
                              </>
                            )}
                            {req.status === 'APPROVED' && (
                              <Button
                                onClick={() => updateRequestStatus(req.id, 'RECEIVED')}
                                size="sm"
                                className="bg-white/5 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest h-9"
                              >Confirm Entry</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="vendors" className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendors.map((vendor: any) => (
                <Card key={vendor.id} className="bg-[#0a1120] border-white/5 rounded-3xl overflow-hidden group hover:border-primary/40 transition-all p-6 relative">
                  <div className="flex justify-between items-start mb-6">
                    <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center p-3">
                      <Truck className="h-full w-full text-primary" />
                    </div>
                    <Button variant="ghost" className="h-8 w-8 p-0 rounded-xl">
                      <MoreVertical className="h-4 w-4 text-slate-500" />
                    </Button>
                  </div>
                  <CardTitle className="text-xl font-black text-white uppercase tracking-tighter italic mb-1">{vendor.name}</CardTitle>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">{vendor.category} Specialist</p>

                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      <MailOpen className="h-4 w-4 text-slate-600" />
                      <span className="text-xs text-slate-300 font-medium">{vendor.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-slate-600" />
                      <span className="text-xs text-slate-300 font-medium">Lead Time: 3-5 days</span>
                    </div>
                  </div>

                  <CardFooter className="p-0 pt-6">
                    <Button className="w-full bg-white/5 border border-white/5 hover:bg-primary hover:text-white rounded-xl font-black uppercase text-[10px] tracking-widest h-11 transition-all">Submit PO</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>

      {/* Register Asset Dialog */}
      <Dialog open={isNewItemOpen} onOpenChange={setIsNewItemOpen}>
        <DialogContent className="bg-[#0a1120] border-white/10 rounded-3xl max-w-2xl p-8 backdrop-blur-3xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-white uppercase tracking-tighter">Register New <span className="text-primary italic">Resource</span></DialogTitle>
            <DialogDescription className="text-slate-500 font-medium pt-2">Add a new identifiable asset to the campus inventory database.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Resource Name</label>
              <Input
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="bg-white/5 border-white/5 text-white h-12 rounded-2xl focus:border-primary/50"
                placeholder="e.g. Dell Monitor 24\"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Classification</label>
              <Select onValueChange={(val) => setNewItem({ ...newItem, category: val })}>
                <SelectTrigger className="bg-white/5 border-white/5 text-white h-12 rounded-2xl focus:border-primary/50">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a1120] border-white/10 p-2 rounded-2xl">
                  <SelectItem value="ELECTRONICS">Electronics & IT</SelectItem>
                  <SelectItem value="FURNITURE">Furniture</SelectItem>
                  <SelectItem value="STATIONERY">Stationery</SelectItem>
                  <SelectItem value="FACILITY">Facility Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Initial Stock</label>
              <Input
                type="number"
                value={newItem.stockLevel}
                onChange={(e) => setNewItem({ ...newItem, stockLevel: parseInt(e.target.value) })}
                className="bg-white/5 border-white/5 text-white h-12 rounded-2xl focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Alert Threshold</label>
              <Input
                type="number"
                value={newItem.minThreshold}
                onChange={(e) => setNewItem({ ...newItem, minThreshold: parseInt(e.target.value) })}
                className="bg-white/5 border-white/5 text-white h-12 rounded-2xl focus:border-primary/50"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Meta Description</label>
              <Input
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="bg-white/5 border-white/5 text-white h-12 rounded-2xl focus:border-primary/50"
              />
            </div>
          </div>
          <DialogFooter className="gap-3 sm:justify-start">
            <Button
              onClick={handleCreateItem}
              className="bg-primary hover:bg-primary-dark text-white rounded-2xl font-black uppercase text-xs h-12 px-8 shadow-xl shadow-primary/20 transition-all active:scale-95"
            >Establish Resource</Button>
            <Button
              variant="ghost"
              onClick={() => setIsNewItemOpen(false)}
              className="text-slate-500 hover:text-white rounded-2xl font-black uppercase text-xs h-12 px-8"
            >Abort</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjust Stock Dialog */}
      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent className="bg-[#0a1120] border-white/10 rounded-3xl max-w-md p-8 backdrop-blur-3xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-white uppercase tracking-tighter">Stock <span className="text-primary italic">Alignment</span></DialogTitle>
            <DialogDescription className="text-slate-500 font-medium pt-2">Manually register stock inflow or consumption for this resource.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5">
              <Button
                onClick={() => setAdjustData({ ...adjustData, type: 'IN' })}
                variant={adjustData.type === 'IN' ? 'default' : 'ghost'}
                className={cn("flex-1 rounded-xl h-10 font-bold uppercase text-[10px]", adjustData.type === 'IN' ? "bg-emerald-500 text-white" : "text-slate-500")}
              >Inflow (+)</Button>
              <Button
                onClick={() => setAdjustData({ ...adjustData, type: 'OUT' })}
                variant={adjustData.type === 'OUT' ? 'default' : 'ghost'}
                className={cn("flex-1 rounded-xl h-10 font-bold uppercase text-[10px]", adjustData.type === 'OUT' ? "bg-rose-500 text-white" : "text-slate-500")}
              >Outflow (-)</Button>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Adjustment Magnitude</label>
              <Input
                type="number"
                value={adjustData.quantity}
                onChange={(e) => setAdjustData({ ...adjustData, quantity: parseInt(e.target.value) })}
                className="bg-white/5 border-white/5 text-white h-12 rounded-2xl focus:border-primary/50 text-center text-xl font-black"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Root Cause / Reason</label>
              <Input
                value={adjustData.reason}
                onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                className="bg-white/5 border-white/5 text-white h-12 rounded-2xl focus:border-primary/50"
                placeholder="e.g. Distributed to CS department"
              />
            </div>
          </div>
          <DialogFooter className="gap-3 sm:justify-start">
            <Button
              onClick={handleAdjustStock}
              className={cn("w-full rounded-2xl font-black uppercase text-xs h-12 shadow-xl transition-all active:scale-95",
                adjustData.type === 'IN' ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" : "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20"
              )}
            >Commit Adjustment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
