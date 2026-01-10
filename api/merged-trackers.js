// api/merged-trackers.js - 读取外部配置文件版本
export default async function handler(req, res) {
  try {
    console.log('开始获取并合并Tracker列表...');
    
    // 1. 读取配置文件 tracker_sources.txt
    // 注意：使用 raw.githubusercontent.com 上的原始文件地址
    const configUrl = 'https://raw.githubusercontent.com/niq0n0pin/yang/main/api/tracker_sources.txt';
    const configResponse = await fetch(configUrl);
    
    if (!configResponse.ok) {
      throw new Error(`无法读取配置文件: ${configResponse.status}`);
    }
    
    const configText = await configResponse.text();
    
    // 2. 解析配置文件，获取链接数组（过滤空行和去除首尾空格）
    const trackerUrls = configText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('#')); // 可选：支持以 # 开头的注释行
    
    console.log(`从配置文件加载了 ${trackerUrls.length} 个Tracker源:`, trackerUrls);
    
    if (trackerUrls.length === 0) {
      throw new Error('配置文件中未找到有效的Tracker链接。');
    }
    
    // 3. 并发抓取所有Tracker列表
    const fetchPromises = trackerUrls.map(url =>
      fetch(url).then(response => {
        if (!response.ok) {
          console.warn(`抓取失败 [${url}]: ${response.status}`);
          return null; // 某个链接失败，返回null，不中断其他抓取
        }
        return response.text();
      }).catch(err => {
        console.error(`抓取异常 [${url}]:`, err.message);
        return null;
      })
    );
    
    const contents = await Promise.all(fetchPromises);
    
    // 4. 合并并清理内容：过滤失败结果，合并文本，并去除重复行
    const validContents = contents.filter(c => c != null && c.trim().length > 0);
    
    if (validContents.length === 0) {
      throw new Error('所有Tracker源均抓取失败，请检查配置链接或网络。');
    }
    
    // 将所有内容合并成一个大字符串
    let mergedText = validContents.join('\n');
    
    // （可选但推荐）基础去重：按行分割，使用Set去重，再重新合并
    const lines = mergedText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const uniqueLines = [...new Set(lines)]; // 利用Set数据结构自动去重
    mergedText = uniqueLines.join('\n');
    
    console.log(`合并完成，共 ${uniqueLines.length} 个唯一Tracker地址。`);
    
    // 5. 返回最终合并后的列表
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send(mergedText);
    
  } catch (error) {
    console.error('处理请求时发生错误:', error);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(500).send('Tracker聚合服务错误: ' + error.message);
  }
}
