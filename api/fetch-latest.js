// api/fetch-latest.js - 最终精简版：原样提取代码块内容
export default async function handler(request, response) {
  try {
    console.log('正在提取README中的原始代码块内容...');
    
    // 1. 获取README的原始内容
    const readmeRawUrl = 'https://raw.githubusercontent.com/free-nodes/v2rayfree/main/README.md';
    const readmeRes = await fetch(readmeRawUrl);
    
    if (!readmeRes.ok) {
      throw new Error(`获取源文件失败: ${readmeRes.status}`);
    }
    
    const fullText = await readmeRes.text();
    
    // 2. 定义代码块标记
    const delimiter = '```';
    
    // 3. 查找第一个标记的位置
    const firstIndex = fullText.indexOf(delimiter);
    if (firstIndex === -1) {
      return response.status(404).send('错误：在源文件中未找到代码块起始标记。');
    }
    
    // 4. 在第一个标记之后，查找第二个标记的位置
    const textAfterFirst = fullText.substring(firstIndex + delimiter.length);
    const secondIndex = textAfterFirst.indexOf(delimiter);
    if (secondIndex === -1) {
      return response.status(404).send('错误：在源文件中未找到匹配的代码块结束标记。');
    }
    
    // 5. 提取两个标记之间的原始内容
    const nodeListText = textAfterFirst.substring(0, secondIndex).trim();
    
    // 6. 按行分割，这将得到一个数组，每一行就是一个节点
    const nodeLines = nodeListText.split('\n');
    const extractedCount = nodeLines.length;
    console.log(`提取完成，共 ${extractedCount} 行。`);
    
    // 7. 直接将原始内容以纯文本形式返回
    // 注意：这里返回的是原样的 nodeListText，它已经是每行一个节点的格式
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.status(200).send(nodeListText);
    
  } catch (error) {
    console.error('处理请求时发生错误:', error);
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.status(500).send('服务器处理失败: ' + error.message);
  }
}
