export async function getNodeContent() {
  console.log('[getNodeContent] 开始执行...');
  try {
    // 1. 尝试获取源文件
    const readmeRawUrl = 'https://raw.githubusercontent.com/free-nodes/v2rayfree/main/README.md';
    console.log(`[getNodeContent] 请求URL: ${readmeRawUrl}`);
    
    let readmeRes;
    try {
      readmeRes = await fetch(readmeRawUrl);
      console.log(`[getNodeContent] 响应状态: ${readmeRes.status} ${readmeRes.statusText}`);
    } catch (fetchError) {
      console.error('[getNodeContent] fetch请求失败:', fetchError.message);
      throw new Error(`网络请求失败: ${fetchError.message}`);
    }
    
    if (!readmeRes.ok) {
      // 打印具体的错误状态
      const errorBody = await readmeRes.text().catch(() => '无法读取错误体');
      console.error(`[getNodeContent] 响应错误详情: ${errorBody.substring(0, 200)}...`);
      throw new Error(`获取源文件失败，HTTP ${readmeRes.status}: ${readmeRes.statusText}`);
    }
    
    // 2. 获取文本内容
    let fullText;
    try {
      fullText = await readmeRes.text();
      console.log(`[getNodeContent] 获取内容成功，长度: ${fullText.length} 字符`);
      console.log(`[getNodeContent] 内容前200字符: ${fullText.substring(0, 200)}...`);
    } catch (textError) {
      console.error('[getNodeContent] 读取响应文本失败:', textError);
      throw new Error(`读取响应内容失败: ${textError.message}`);
    }
    
    // 3. 查找代码块标记
    const delimiter = '```';
    const firstIndex = fullText.indexOf(delimiter);
    console.log(`[getNodeContent] 第一个代码块标记位置: ${firstIndex}`);
    
    if (firstIndex === -1) {
      console.error(`[getNodeContent] 错误：在文件中未找到起始标记'${delimiter}'`);
      console.log(`[getNodeContent] 文件内容预览（全）:\n${fullText}`);
      throw new Error('未找到代码块起始标记。可能源文件格式已发生巨大变化。');
    }
    
    const textAfterFirst = fullText.substring(firstIndex + delimiter.length);
    const secondIndex = textAfterFirst.indexOf(delimiter);
    console.log(`[getNodeContent] 第二个代码块标记位置: ${secondIndex} (相对于第一标记后)`);
    
    if (secondIndex === -1) {
      console.error(`[getNodeContent] 错误：在第一个标记后未找到结束标记'${delimiter}'`);
      throw new Error('未找到匹配的代码块结束标记。');
    }
    
    // 4. 提取内容
    const nodeListText = textAfterFirst.substring(0, secondIndex).trim();
    console.log(`[getNodeContent] 提取节点文本成功，长度: ${nodeListText.length} 字符`);
    console.log(`[getNodeContent] 节点文本预览: ${nodeListText.substring(0, 150)}...`);
    
    // 快速验证格式
    const lines = nodeListText.split('\n').filter(line => line.trim().length > 0);
    console.log(`[getNodeContent] 非空行数: ${lines.length}`);
    if (lines.length === 0) {
      throw new Error('提取的代码块内容为空。');
    }
    
    return nodeListText;
  } catch (error) {
    // 记录完整的错误堆栈
    console.error('[getNodeContent] 函数执行失败，完整错误:', error);
    // 重新抛出错误，保持原有行为
    throw error;
  }
}
