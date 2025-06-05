'use client'

import type { ModelWithLiked, PostModel } from '@mx-space/api-client'

import { AckRead } from '~/components/common/AckRead'
import { ClientOnly } from '~/components/common/ClientOnly'
import {
  PostActionAside,
  PostBottomBarAction,
  PostCopyright,
  PostOutdate,
  PostRelated,
} from '~/components/modules/post'
import { ArticleRightAside } from '~/components/modules/shared/ArticleRightAside'
import { GoToAdminEditingButton } from '~/components/modules/shared/GoToAdminEditingButton'
import { ReadIndicatorForMobile } from '~/components/modules/shared/ReadIndicator'
import { SummarySwitcher } from '~/components/modules/shared/SummarySwitcher'
import { XLogInfoForPost } from '~/components/modules/xlog'
import { useArticleRoom } from '~/hooks/article/use-article-room'
import { LayoutRightSidePortal } from '~/providers/shared/LayoutRightSideProvider'
import { WrappedElementProvider } from '~/providers/shared/WrappedElementProvider'

import {
  HeaderMetaInfoSetting,
  MarkdownSelection,
  PostMarkdown,
  PostMarkdownImageRecordProvider,
  PostMetaBarInternal,
  PostTitle,
} from './pageExtra'

export const ClientPostPage = ({
  data,
}: {
  data: ModelWithLiked<PostModel>
}) => {
  // 使用文章房间钩子，加入对应的房间
  useArticleRoom(data.id)

  const { id } = data
  return (
    <div className="relative w-full min-w-0">
      <AckRead id={id} type="post" />
      <HeaderMetaInfoSetting />
      <div>
        <div className="mb-8">
          <PostTitle />
          <GoToAdminEditingButton
            id={id!}
            type="posts"
            className="absolute -top-6 right-0"
          />

          <PostMetaBarInternal className="mb-8 justify-center" />

          <SummarySwitcher data={data} />

          <PostOutdate />

          <PostRelated infoText="阅读此文章之前，你可能需要首先阅读以下的文章才能更好的理解上下文。" />
        </div>
        <WrappedElementProvider eoaDetect>
          <ReadIndicatorForMobile />

          <PostMarkdownImageRecordProvider>
            <MarkdownSelection>
              <article className="prose">
                <div className="sr-only">
                  <PostTitle />
                </div>
                <PostMarkdown />
              </article>
            </MarkdownSelection>
          </PostMarkdownImageRecordProvider>

          <LayoutRightSidePortal>
            <ArticleRightAside>
              <PostActionAside />
            </ArticleRightAside>
          </LayoutRightSidePortal>
        </WrappedElementProvider>
      </div>
      <ClientOnly>
        <PostRelated infoText="关联阅读" />
        <PostCopyright />

        {/* <SubscribeBell defaultType="post_c" /> */}
        <XLogInfoForPost />
        <PostBottomBarAction />
      </ClientOnly>
    </div>
  )
}
