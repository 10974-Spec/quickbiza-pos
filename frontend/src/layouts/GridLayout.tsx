import React from 'react';
import { SidebarLayout } from './SidebarLayout';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, Tooltip } from 'recharts';
import { TrendingUp, MoreHorizontal, ArrowUpRight } from 'lucide-react';

const Card = ({ title, children, className }: { title: string, children: React.ReactNode, className?: string }) => (
    <div className={`bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col ${className}`}>
        <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-sm text-muted-foreground">{title}</h3>
            <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 min-h-0">
            {children}
        </div>
    </div>
);

const data = [
    { name: 'Mon', value: 4000 },
    { name: 'Tue', value: 3000 },
    { name: 'Wed', value: 2000 },
    { name: 'Thu', value: 2780 },
    { name: 'Fri', value: 1890 },
    { name: 'Sat', value: 2390 },
    { name: 'Sun', value: 3490 },
];

export const GridLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <SidebarLayout>
            <div className="p-6 h-full flex flex-col gap-6">
                {/* Simulated Widget Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-2">
                    <Card title="Total Revenue" className="md:col-span-1 h-40">
                        <div className="flex items-end justify-between">
                            <span className="text-2xl font-bold">$45,231.89</span>
                            <span className="text-green-500 text-xs flex items-center gap-1">+20.1% <TrendingUp className="w-3 h-3" /></span>
                        </div>
                        <div className="h-[40px] mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                    <Card title="Active Users" className="md:col-span-1 h-40">
                        <div className="flex items-end justify-between">
                            <span className="text-2xl font-bold">2,350</span>
                            <span className="text-green-500 text-xs flex items-center gap-1">+180 <ArrowUpRight className="w-3 h-3" /></span>
                        </div>
                        <div className="mt-4 flex -space-x-2 overflow-hidden">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-background bg-muted flex items-center justify-center text-[10px] font-bold">U{i}</div>
                            ))}
                            <div className="inline-block h-6 w-6 rounded-full ring-2 ring-background bg-muted flex items-center justify-center text-[10px] text-muted-foreground">+42</div>
                        </div>
                    </Card>
                    <Card title="Sales" className="md:col-span-1 lg:col-span-2 h-40">
                        <div className="h-[100px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data}>
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex-1 overflow-auto">
                    {children}
                </div>
            </div>
        </SidebarLayout>
    );
};
