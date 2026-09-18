// Markdown Generator & Exporter Component
class MarkdownExporter {
  static generateMonthlyMarkdown(state, targetMonth) {
    const [year, month] = targetMonth.split('-');
    let md = [];

    md.push(`# 📅 个人工作月报 · ${year} 年 ${month} 月`);
    md.push(`> 导出时间：${new Date().toLocaleString()} | 软件系统：FoFo 个人工作台\n`);

    // 1. Monthly Goals
    md.push(`## 🎯 一、月度核心目标 (Monthly Goals)`);
    const monthlyGoals = (state.monthlyGoals || []).filter(g => g.month === targetMonth);
    if (monthlyGoals.length === 0) {
      md.push(`*本月暂未设定目标*\n`);
    } else {
      monthlyGoals.forEach((g, idx) => {
        const check = g.done ? '[x]' : '[ ]';
        const progress = g.progress !== undefined ? ` (进度: ${g.progress}%)` : '';
        md.push(`- ${check} **目标 ${idx + 1}**：${g.text}${progress}`);
      });
      md.push('');
    }

    // 2. Weekly Goals & Summaries
    md.push(`## 📌 二、各周重点与推进 (Weekly Focus)`);
    const weeklyGoals = (state.weeklyGoals || []).filter(g => g.week && g.week.startsWith(targetMonth));
    if (weeklyGoals.length === 0) {
      md.push(`*本月暂无周重点记录*\n`);
    } else {
      weeklyGoals.forEach(w => {
        const check = w.done ? '[x]' : '[ ]';
        md.push(`### ${w.weekTitle || w.week}`);
        md.push(`- ${check} ${w.text}`);
        if (w.summary) {
          md.push(`\n**周复盘总结**：\n> ${w.summary.replace(/\n/g, '\n> ')}`);
        }
        md.push('');
      });
    }

    // 3. Productivity Stats
    let totalTasksCompleted = 0;
    let totalPomodoros = 0;
    let totalWaterMl = 0;
    const dailyKeys = Object.keys(state.dailyData || {})
      .filter(d => d.startsWith(targetMonth))
      .sort();

    dailyKeys.forEach(date => {
      const day = state.dailyData[date];
      if (day.tasks) {
        day.tasks.forEach(t => {
          if (t.done) totalTasksCompleted++;
          totalPomodoros += (t.pomodoros || 0);
        });
      }
      totalWaterMl += (day.waterIntake || 0);
    });

    md.push(`## 📊 三、专注与产出统计 (Productivity Metrics)`);
    md.push(`- **累计完成任务数**：${totalTasksCompleted} 个`);
    md.push(`- **累计专注番茄钟**：${totalPomodoros} 🍅 (~ ${(totalPomodoros * 25 / 60).toFixed(1)} 小时)`);
    md.push(`- **累计健康饮水量**：${(totalWaterMl / 1000).toFixed(1)} L`);
    md.push(`- **活跃工作天数**：${dailyKeys.length} 天\n`);

    // 4. Daily Workflows
    md.push(`## 📋 四、每日工作流归档 (Daily Workflow)`);
    if (dailyKeys.length === 0) {
      md.push(`*暂无每日详细工作流*\n`);
    } else {
      dailyKeys.forEach(date => {
        const day = state.dailyData[date];
        const dayObj = new Date(date);
        const weekday = ['周日', '周一', '周二', '周三', '周四', '五', '周六'][dayObj.getDay()];
        
        // Multi-milestone formatting
        let milestoneTags = '';
        if (day.milestones && day.milestones.length > 0) {
          milestoneTags = ` 🚩 **[重要节点: ${day.milestones.map(m => m.text).join(' · ')}]**`;
        } else if (day.milestone) {
          milestoneTags = ` 🚩 **[重要节点: ${day.milestone}]**`;
        }
        
        md.push(`### 🗓️ ${date} (${weekday})${milestoneTags}`);
        
        // Today's Reading list
        if (day.readingList && day.readingList.length > 0) {
          md.push(`\n**今日待阅文档/网页**：`);
          day.readingList.forEach(r => {
            const icon = r.type === 'doc' ? '📄' : '🌐';
            md.push(`- ${icon} **${r.title}** (${r.path})`);
          });
        }

        // Tasks
        if (day.tasks && day.tasks.length > 0) {
          md.push(`\n**任务清单**：`);
          day.tasks.forEach(t => {
            const check = t.done ? '[x]' : '[ ]';
            const pomo = t.pomodoros ? ` 🍅x${t.pomodoros}` : '';
            const prio = t.priority ? ` \`[${t.priority}]\`` : '';
            md.push(`- ${check}${prio} ${t.text}${pomo}`);
          });
        }

        // Notes
        if (day.notes && day.notes.trim()) {
          md.push(`\n**工作纪要 / 会议记录**：\n${day.notes.trim()}`);
        }

        md.push('\n---\n');
      });
    }

    // 5. Bulletin & Scratchpad
    md.push(`## 📌 五、备忘公告栏与长期提醒 (Bulletin Board)`);
    const bulletin = state.bulletin || [];
    if (bulletin.length === 0) {
      md.push(`*暂无长期公告*\n`);
    } else {
      bulletin.forEach((b, idx) => {
        md.push(`${idx + 1}. [${b.createdAt || ''}] ${b.text}`);
      });
      md.push('');
    }

    md.push(`## 💡 六、备忘录与灵感捕捉 (Memos & Scratchpad)`);
    const scratchpad = state.scratchpad || [];
    if (scratchpad.length === 0) {
      md.push(`*暂无备忘事项*\n`);
    } else {
      scratchpad.forEach((s, idx) => {
        md.push(`${idx + 1}. [${s.createdAt || ''}] ${s.text}`);
      });
      md.push('');
    }

    return md.join('\n');
  }

  static downloadMarkdownFile(filename, content) {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static async saveToDiskViaServer(filename, content) {
    try {
      const resp = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, content })
      });
      if (resp.ok) {
        const res = await resp.json();
        return { success: true, filepath: res.filepath };
      }
    } catch (e) {
      // Backend not running
    }
    return { success: false };
  }
}

window.MarkdownExporter = MarkdownExporter;
