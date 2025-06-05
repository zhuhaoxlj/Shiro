import type { FC } from 'react'
import { memo } from 'react'

import { appStaticConfig } from '~/app.static.config'
import { ErrorBoundary } from '~/components/common/ErrorBoundary'
import { clsxm } from '~/lib/helper'

import type { AiSummaryProps } from '../ai/Summary'
import { AISummary } from '../ai/Summary'
import { XLogSummary } from '../xlog'
import { getCidForBaseModel } from '../xlog/utils'

// Keyframes for the flowing rainbow ribbon effect
const techBorderKeyframes = `
@keyframes flowingRainbow {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
}
`

// Add the keyframes to the document
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.innerHTML = techBorderKeyframes
  document.head.append(style)
}

export const SummarySwitcher: FC<
  AiSummaryProps & {
    summary?: string
  }
> = memo((props) => {
  const { enabled, providers } = appStaticConfig.ai.summary
  const { data, summary } = props
  const cid = getCidForBaseModel(data)

  const finalSummary = 'summary' in data ? data.summary : summary
  if (finalSummary && finalSummary.trim().length > 0)
    return <ManualSummary className="my-4" summary={finalSummary} />

  if (!enabled) return null

  let comp: any

  for (const provider of providers) {
    if (comp) break
    switch (provider) {
      case 'xlog': {
        if (cid) comp = <XLogSummary cid={cid} />
        break
      }
      case 'openai': {
        if (!process.env.OPENAI_API_KEY) break
        if (data) comp = <AISummary data={data} />
      }
    }
  }

  if (!comp) return null

  return (
    <ErrorBoundary>
      <div className="my-4">{comp}</div>
    </ErrorBoundary>
  )
})

SummarySwitcher.displayName = 'SummarySwitcher'

const ManualSummary: Component<{
  summary: string
}> = ({ className, summary }) => {
  return (
    <div
      className={clsxm(
        `relative space-y-2 rounded-xl p-4 overflow-hidden`,
        `before:absolute before:inset-0 before:z-0 before:rounded-xl`,
        `before:p-[2px] before:bg-gradient-to-r before:from-violet-500 before:via-blue-500 before:via-cyan-500 before:via-emerald-500 before:via-amber-500 before:via-rose-500 before:to-violet-500`,
        `before:bg-[length:200%_auto] before:animate-[flowingRainbow_2s_linear_infinite]`,
        `shadow-[0_0_15px_rgba(140,140,255,0.6)]`,
        className,
      )}
    >
      {/* 内部背景 */}
      <div className="absolute inset-[3px] z-0 rounded-lg bg-gradient-to-b from-gray-50 to-gray-100 dark:from-neutral-900 dark:to-neutral-950" />

      {/* 内容区 */}
      <div className="relative z-10">
        <div className="mb-2 flex items-center">
          <i className="i-mingcute-sparkles-line mr-2 text-lg text-purple-600 dark:text-indigo-400" />
          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text font-medium text-transparent dark:from-indigo-400 dark:to-blue-400">
            AI 摘要
          </span>
        </div>
        <div className="!m-0 text-sm leading-loose text-gray-700 dark:text-base-content/85">
          {summary}
        </div>
      </div>
    </div>
  )
}
