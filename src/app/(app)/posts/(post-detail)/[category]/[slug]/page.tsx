import type { ModelWithLiked, PostModel } from '@mx-space/api-client'
import type { Metadata } from 'next'

import { CommentAreaRootLazy } from '~/components/modules/comment'
import { TocFAB } from '~/components/modules/toc/TocFAB'
import {
  BottomToUpSoftScaleTransitionView,
  BottomToUpTransitionView,
} from '~/components/ui/transition'
import { OnlyMobile } from '~/components/ui/viewport/OnlyMobile'
import { getOgUrl } from '~/lib/helper.server'
import { getSummaryFromMd } from '~/lib/markdown'
import { definePrerenderPage } from '~/lib/request.server'
import { CurrentPostDataProvider } from '~/providers/post/CurrentPostDataProvider'
import {
  LayoutRightSideProvider,
} from '~/providers/shared/LayoutRightSideProvider'

import type { PageParams } from './api'
import { getData } from './api'
// 创建一个客户端组件包装器
import { ClientPostPage } from './ClientPostPage'
import {
  SlugReplacer,
} from './pageExtra'

export const dynamic = 'force-dynamic'

export const generateMetadata = async ({
  params,
}: {
  params: PageParams
}): Promise<Metadata> => {
  const { slug } = params
  try {
    const data = await getData(params)
    const {
      title,
      category: { slug: categorySlug },
      text,
      meta,
    } = data
    const description = getSummaryFromMd(text ?? '')

    const ogImage = getOgUrl('post', {
      category: categorySlug,
      slug,
    })

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: ogImage,
        type: 'article',
      },
      twitter: {
        images: ogImage,
        title,
        description,
        card: 'summary_large_image',
      },
      category: categorySlug,
    } satisfies Metadata
  } catch {
    return {}
  }
}

const PostPage = ({ data }: { data: ModelWithLiked<PostModel> }) => {
  return <ClientPostPage data={data} />
}

export default definePrerenderPage<PageParams>()({
  fetcher(params) {
    return getData(params)
  },

  Component: async (props) => {
    const { data, params } = props

    const fullPath = `/posts/${data.category.slug}/${data.slug}`
    const currentPath = `/posts/${params.category}/${params.slug}`

    return (
      <>
        {currentPath !== fullPath && <SlugReplacer to={fullPath} />}

        <CurrentPostDataProvider data={data} />
        <div className="relative flex min-h-[120px] grid-cols-[auto,200px] lg:grid">
          <BottomToUpTransitionView className="min-w-0">
            <PostPage data={data} />

            <BottomToUpSoftScaleTransitionView delay={500}>
              <CommentAreaRootLazy
                refId={data.id}
                allowComment={data.allowComment}
              />
            </BottomToUpSoftScaleTransitionView>
          </BottomToUpTransitionView>

          <LayoutRightSideProvider className="relative hidden lg:block" />
        </div>

        <OnlyMobile>
          <TocFAB />
        </OnlyMobile>
      </>
    )
  },
})
