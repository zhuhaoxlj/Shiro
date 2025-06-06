import { NextResponse } from 'next/server'

// 缓存获取的链接预览，避免重复请求
const linkPreviewCache = new Map<
  string,
  { title: string; favicon: string; description: string }
>()

export async function POST(request: Request) {
  try {
    const { url } = await request.json()
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // 检查缓存
    if (linkPreviewCache.has(url)) {
      return NextResponse.json(linkPreviewCache.get(url))
    }

    // 获取网页内容
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0)',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.statusText}` },
        { status: 500 },
      )
    }

    const html = await response.text()

    // 提取网页标题
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : ''

    // 提取网页描述
    const descriptionMatch =
      html.match(
        /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
      ) ||
      html.match(
        /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i,
      ) ||
      html.match(
        /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
      ) ||
      html.match(
        /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["'][^>]*>/i,
      )
    const description = descriptionMatch ? descriptionMatch[1].trim() : ''

    // 提取网页图标
    const faviconMatch =
      html.match(
        /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["'][^>]*>/i,
      ) ||
      html.match(
        /<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["'][^>]*>/i,
      )

    let favicon = faviconMatch ? faviconMatch[1].trim() : ''

    // 如果图标URL是相对路径，转为绝对路径
    if (favicon && !favicon.startsWith('http')) {
      const urlObj = new URL(url)
      favicon = favicon.startsWith('/')
        ? `${urlObj.protocol}//${urlObj.host}${favicon}`
        : `${urlObj.protocol}//${urlObj.host}/${favicon}`
    }

    // 如果没有找到图标，使用默认的favicon.ico
    if (!favicon) {
      const urlObj = new URL(url)
      favicon = `${urlObj.protocol}//${urlObj.host}/favicon.ico`
    }

    const result = { title, favicon, description }

    // 存入缓存
    linkPreviewCache.set(url, result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching link preview:', error)
    return NextResponse.json(
      { error: 'Failed to generate link preview' },
      { status: 500 },
    )
  }
}
