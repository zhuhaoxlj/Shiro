'use client'

import type { NoteModel } from '@mx-space/api-client'

import { AckRead } from '~/components/common/AckRead'
import { ClientOnly } from '~/components/common/ClientOnly'
import {
  NoteActionAside,
  NoteBottomBarAction,
  NoteBottomTopic,
  NoteFooterNavigationBarForMobile,
  NoteMetaBar,
} from '~/components/modules/note'
import {
  NoteBanner,
  NoteRootBanner,
} from '~/components/modules/note/NoteBanner'
import { ArticleRightAside } from '~/components/modules/shared/ArticleRightAside'
import { BanCopyWrapper } from '~/components/modules/shared/BanCopyWrapper'
import { ReadIndicatorForMobile } from '~/components/modules/shared/ReadIndicator'
import { SummarySwitcher } from '~/components/modules/shared/SummarySwitcher'
import { XLogInfoForNote } from '~/components/modules/xlog'
import { useArticleRoom } from '~/hooks/article/use-article-room'
import { LayoutRightSidePortal } from '~/providers/shared/LayoutRightSideProvider'
import { WrappedElementProvider } from '~/providers/shared/WrappedElementProvider'

import { NoteHeadCover } from '../../../../components/modules/note/NoteHeadCover'
import { NoteHideIfSecret } from '../../../../components/modules/note/NoteHideIfSecret'
import {
  IndentArticleContainer,
  MarkdownSelection,
  NoteHeaderDate,
  NoteHeaderMetaInfoSetting,
  NoteMarkdown,
  NoteMarkdownImageRecordProvider,
  NoteTitle,
} from './pageExtra'

export const ClientPageInner = ({ data }: { data: NoteModel }) => {
  // 使用文章房间钩子，加入对应的房间
  useArticleRoom(data.id)

  return (
    <>
      <AckRead id={data.id} type="note" />

      <NoteHeadCover image={data.meta?.cover} />
      <NoteHeaderMetaInfoSetting />
      <div>
        <NoteTitle />
        <span className="flex flex-wrap items-center text-sm text-neutral-content/60">
          <NoteHeaderDate />

          <ClientOnly>
            <NoteMetaBar />
          </ClientOnly>
        </span>

        <NoteRootBanner />
        {data.hide && (
          <NoteBanner type="warning" message="这篇文章是非公开的，仅登录可见" />
        )}
      </div>

      <NoteHideIfSecret>
        <SummarySwitcher data={data} />
        <WrappedElementProvider eoaDetect>
          <ReadIndicatorForMobile />
          <NoteMarkdownImageRecordProvider>
            <BanCopyWrapper>
              <MarkdownSelection>
                <IndentArticleContainer>
                  <header className="sr-only">
                    <NoteTitle />
                  </header>
                  <NoteMarkdown />
                </IndentArticleContainer>
              </MarkdownSelection>
            </BanCopyWrapper>
          </NoteMarkdownImageRecordProvider>

          <LayoutRightSidePortal>
            <ArticleRightAside>
              <NoteActionAside />
            </ArticleRightAside>
          </LayoutRightSidePortal>
        </WrappedElementProvider>
      </NoteHideIfSecret>
      {/* <SubscribeBell defaultType="note_c" /> */}
      <ClientOnly>
        <div className="mt-8" data-hide-print />
        <NoteBottomBarAction />
        <NoteBottomTopic />
        <XLogInfoForNote />
        <NoteFooterNavigationBarForMobile />
      </ClientOnly>
    </>
  )
}
