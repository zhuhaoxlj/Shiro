import type { NoteModel } from '@mx-space/api-client'
import type { Metadata } from 'next'

import { CommentAreaRootLazy } from '~/components/modules/comment'
import {
  NotePasswordForm,
} from '~/components/modules/note'
import { NoteFontSettingFab } from '~/components/modules/note/NoteFontFab'
import { NoteMainContainer } from '~/components/modules/note/NoteMainContainer'
import { TocFAB } from '~/components/modules/toc/TocFAB'
import { BottomToUpSoftScaleTransitionView } from '~/components/ui/transition'
import { OnlyMobile } from '~/components/ui/viewport/OnlyMobile'
import { getOgUrl } from '~/lib/helper.server'
import { getSummaryFromMd } from '~/lib/markdown'
import { definePrerenderPage } from '~/lib/request.server'
import {
  CurrentNoteDataProvider,
  SyncNoteDataAfterLoggedIn,
} from '~/providers/note/CurrentNoteDataProvider'
import { CurrentNoteNidProvider } from '~/providers/note/CurrentNoteIdProvider'

import { Paper } from '../../../../components/layout/container/Paper'
import { getData } from './api'
import { ClientPageInner } from './ClientPageInner'
import { Transition } from './Transition'

export const dynamic = 'force-dynamic'

function PageInner({ data }: { data: NoteModel }) {
  return <ClientPageInner data={data} />
}

type NoteDetailPageParams = {
  id: string

  password?: string
  token?: string
}
export const generateMetadata = async ({
  params,
}: {
  params: NoteDetailPageParams
}): Promise<Metadata> => {
  try {
    const res = await getData(params)

    const { data } = res
    const { title, text } = data
    const description = getSummaryFromMd(text ?? '')

    const ogUrl = getOgUrl('note', {
      nid: params.id,
    })

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: ogUrl,
        type: 'article',
      },
      twitter: {
        images: ogUrl,
        title,
        description,
        card: 'summary_large_image',
      },
    } satisfies Metadata
  } catch {
    return {}
  }
}

export default definePrerenderPage<NoteDetailPageParams>()({
  fetcher: getData,
  requestErrorRenderer(error, parsed, { id }) {
    const { status } = parsed

    if (status === 403) {
      return (
        <Paper>
          <NotePasswordForm />
          <CurrentNoteNidProvider nid={id} />
        </Paper>
      )
    }
  },
  Component({ data, params: { id: nid } }) {
    return (
      <>
        <CurrentNoteNidProvider nid={nid} />
        <CurrentNoteDataProvider data={data} />

        <SyncNoteDataAfterLoggedIn />

        <Transition className="min-w-0" lcpOptimization>
          <Paper key={nid} as={NoteMainContainer}>
            <PageInner data={data.data} />
          </Paper>
          <BottomToUpSoftScaleTransitionView delay={500}>
            <CommentAreaRootLazy
              refId={data.data.id}
              allowComment={data.data.allowComment}
            />
          </BottomToUpSoftScaleTransitionView>
        </Transition>

        <NoteFontSettingFab />

        <OnlyMobile>
          <TocFAB />
        </OnlyMobile>
      </>
    )
  },
})
