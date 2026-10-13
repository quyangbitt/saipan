import { useState, useEffect } from 'react';
import {
  fetchTrends, fetchSchedule, fetchOutputs, fetchIdeas,
} from '../lib/api';
import type {
  TrendGroup, ScheduleItem, OutputNode, Idea,
} from '../lib/api';
import type { Page } from './Sidebar';
import {
  IconFire, IconCalendar, IconOutputs, IconChat, IconSkills,
  IconIdea, IconPublish,
} from './icons';

interface DashboardProps {
  persona: string;
  gatewayStatus: string;
  apiDirect: boolean;
  agentRuntime: string;
  onNavigate: (page: Page) => void;
  onUseTopic: (title: string) => void;
}

const STATUS_LABEL: Record<string, string> = { idea: '选题', draft: '草稿', scheduled: '待发', published: '已发' };

export default function DashboardPage({ onNavigate, onUseTopic }: DashboardProps) {
  const [trends, setTrends] = useState<TrendGroup[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [outputs, setOutputs] = useState<OutputNode[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);

  useEffect(() => {
    fetchTrends('weibo,douyin', 6).then((d) => setTrends(d.trends)).catch(() => {});
    fetchSchedule().then(setSchedule).catch(() => {});
    fetchOutputs().then(setOutputs).catch(() => {});
    fetchIdeas().then(setIdeas).catch(() => {});
  }, []);

  const hour = new Date().getHours();
  const greet = hour < 6 ? '夜深了' : hour < 12 ? '上午好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好';
  const todayStr = new Date().toISOString().slice(0, 10);
  const upcoming = [...schedule]
    .filter((s) => s.date >= todayStr && s.status !== 'published')
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 5);
  const recent = outputs.slice(0, 5);
  const pendingIdeas = ideas.filter((i) => i.status === 'pending');

  const quick: { label: string; page: Page; Icon: typeof IconChat }[] = [
    { label: '开始对话', page: 'chat', Icon: IconChat },
    { label: '看热点', page: 'trends', Icon: IconFire },
    { label: '拆爆款', page: 'breakdown', Icon: IconSkills },
    { label: '记选题', page: 'ideas', Icon: IconIdea },
    { label: '排日历', page: 'calendar', Icon: IconCalendar },
    { label: '内容创作', page: 'publish', Icon: IconPublish },
  ];

  const stats: { label: string; value: string; page: Page; Icon: typeof IconChat }[] = [
    { label: '待做选题', value: String(pendingIdeas.length), page: 'ideas', Icon: IconIdea },
    { label: '待发排期', value: String(upcoming.length), page: 'calendar', Icon: IconCalendar },
    { label: '内容项目', value: String(outputs.length), page: 'outputs', Icon: IconOutputs },
  ];

  return (
    <div className="page-scroll dash-page">
      <div className="dash-hero">
        <h1 className="page-title" style={{ fontSize: 26 }}>{greet} 👋</h1>
        <div className="dash-quick">
          {quick.map((q) => (
            <button key={q.page} className="dash-quick-btn" onClick={() => onNavigate(q.page)}>
              <q.Icon size={16} /><span>{q.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 概览数字 */}
      <div className="dash-stats">
        {stats.map((s) => (
          <button key={s.label} className="card card-hover dash-stat" onClick={() => onNavigate(s.page)}>
            <span className="dash-stat-ic"><s.Icon size={18} /></span>
            <span className="dash-stat-val">{s.value}</span>
            <span className="dash-stat-label">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="dash-grid">
        {/* 今日热点 */}
        <div className="card dash-card dash-trends">
          <div className="dash-card-head">
            <span><IconFire size={16} /> 今日热点</span>
            <button className="dash-more" onClick={() => onNavigate('trends')}>热点雷达 →</button>
          </div>
          {trends.length === 0 && <div className="dash-empty">热点加载中 / 需配置代理</div>}
          {trends.map((g) => (
            <div key={g.platform} className="dash-trend-group">
              <div className="dash-trend-plat">{g.label}</div>
              {g.items.slice(0, 3).map((it, i) => (
                <div key={i} className="dash-trend-item" title={`${it.title}（点击做成内容）`}>
                  <span className="dash-trend-title" onClick={() => onUseTopic(it.title)}>{it.title}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* 选题库 */}
        <div className="card dash-card">
          <div className="dash-card-head">
            <span><IconIdea size={16} /> 选题库 · 待做</span>
            <button className="dash-more" onClick={() => onNavigate('ideas')}>全部 →</button>
          </div>
          {pendingIdeas.length === 0 && <div className="dash-empty">还没攒选题，去热点雷达收藏几个吧</div>}
          {pendingIdeas.slice(0, 5).map((it) => (
            <div key={it.id} className="dash-idea" onClick={() => onUseTopic(it.title)} title="点击做成内容">
              <span className="dash-idea-title">{it.title}</span>
              {it.source && <span className="badge">{it.source}</span>}
            </div>
          ))}
        </div>

        {/* 近期排期 */}
        <div className="card dash-card">
          <div className="dash-card-head">
            <span><IconCalendar size={16} /> 近期排期</span>
            <button className="dash-more" onClick={() => onNavigate('calendar')}>日历 →</button>
          </div>
          {upcoming.length === 0 && <div className="dash-empty">暂无排期，去日历安排一条吧</div>}
          {upcoming.map((s) => (
            <div key={s.id} className="dash-sched" onClick={() => onNavigate('calendar')}>
              <span className="dash-sched-date">{s.date.slice(5)}</span>
              <span className="dash-sched-title">{s.platform ? `[${s.platform}] ` : ''}{s.title}</span>
              <span className="badge">{STATUS_LABEL[s.status] || s.status}</span>
            </div>
          ))}
        </div>

        {/* 最近产物 */}
        <div className="card dash-card dash-card-top">
          <div className="dash-card-head">
            <span><IconOutputs size={16} /> 最近产物</span>
            <button className="dash-more" onClick={() => onNavigate('outputs')}>生成内容 →</button>
          </div>
          {recent.length === 0 && <div className="dash-empty">还没有产物，去对话生成第一条吧</div>}
          {recent.map((g) => (
            <div key={g.name} className="dash-output" onClick={() => onNavigate('outputs')}>
              <span className="dash-output-name">{g.meta?.title || g.name}</span>
              <span className="badge">{g.meta?.platform || (g.type === 'dir' ? `${g.fileCount ?? 0} 文件` : '单文件')}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
