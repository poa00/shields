import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import { InvalidResponse, pathParams } from '../index.js'
import { formatDate } from '../text-formatters.js'
import { age as ageColor } from '../color-formatters.js'
import { description, BaseWordpress } from './wordpress-base.js'
dayjs.extend(customParseFormat)

const extensionData = {
  plugin: {
    capt: 'Plugin',
    exampleSlug: 'bbpress',
    lastUpdateFormat: 'YYYY-MM-DD hh:mma [GMT]',
  },
  theme: {
    capt: 'Theme',
    exampleSlug: 'twentyseventeen',
    lastUpdateFormat: 'YYYY-MM-DD',
  },
}

function LastUpdateForType(extensionType) {
  const { capt, exampleSlug, lastUpdateFormat } = extensionData[extensionType]

  return class WordpressLastUpdate extends BaseWordpress {
    static name = `Wordpress${capt}LastUpdated`

    static category = 'activity'

    static route = {
      base: `wordpress/${extensionType}/last-updated`,
      pattern: ':slug',
    }

    static get openApi() {
      const key = `/wordpress/${extensionType}/last-updated/{slug}`
      const route = {}
      route[key] = {
        get: {
          summary: `WordPress ${capt} Last Updated`,
          description,
          parameters: pathParams({
            name: 'slug',
            example: exampleSlug,
          }),
        },
      }
      return route
    }

    static defaultBadgeData = { label: 'last updated' }

    static render({ lastUpdated }) {
      return {
        label: 'last updated',
        message: formatDate(lastUpdated),
        color: ageColor(lastUpdated),
      }
    }

    transform(lastUpdate) {
      const date = dayjs(lastUpdate, lastUpdateFormat)

      if (date.isValid()) {
        return date.format('YYYY-MM-DD')
      } else {
        throw new InvalidResponse({ prettyMessage: 'invalid date' })
      }
    }

    async handle({ slug }) {
      const { last_updated: lastUpdated } = await this.fetch({
        extensionType,
        slug,
      })

      const newDate = this.transform(lastUpdated)

      return this.constructor.render({
        lastUpdated: newDate,
      })
    }
  }
}

const lastupdate = ['plugin', 'theme'].map(LastUpdateForType)
export default [...lastupdate]
