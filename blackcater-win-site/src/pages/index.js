import React, { Component } from 'react'
import { Icon, Button, PostList } from 'components'
import { isMobile } from 'utils/common'
import axios from 'axios'

import './index.styl'

const NAMESPACE = 'UNSPLASH_IMG__BL0G_INDEX_PAGE'

export default class IndexPage extends Component {
  componentDidMount() {
    const mobile = isMobile()
    const width = mobile ? '600' : '1800'

    if (this.shouldFetchUnsplashPhoto()) {
      // 需要更新
      this.fetchUnsplashPhoto(urls => {
        window.localStorage.setItem(
          NAMESPACE,
          JSON.stringify({
            date: Date.now(),
            urls,
          })
        )

        this.props.setCover(`${urls.full}?w=${width}`)
      })
    } else {
      const { urls } = JSON.parse(
        window.localStorage.getItem(NAMESPACE) || '{}'
      )

      this.props.setCover(`${urls.full}?w=${width}`)
    }

    this.props.setTitle(this.props.data.site.siteMetadata.title)
  }

  // 判断是否需要更新图片
  shouldFetchUnsplashPhoto = () => {
    const { date } = JSON.parse(window.localStorage.getItem(NAMESPACE) || '{}')
    const now = new Date()

    if (!date) return true

    const past = new Date(date)

    return !(
      past.getFullYear() === now.getFullYear() &&
      past.getMonth() === now.getMonth() &&
      past.getDay() === now.getDay()
    )
  }

  // 获取 unsplash 图片
  fetchUnsplashPhoto = (cb, errCb) => {
    const mobile = isMobile()
    const orientation = mobile ? 'portrait' : 'landscape'

    axios
      .get('https://api.unsplash.com/photos/random', {
        params: {
          query: 'landscape',
          orientation,
        },
        headers: {
          'Accept-Version': 'v1',
          Authorization:
            'Client-ID 2293f4e76a8b62a4e5c08a6d05f74d0f12c4cc9e84dc697736d50a422d9a541c',
        },
      })
      .then(({ data }) => {
        if (cb) cb(data.urls)
      })
      .catch(errCb)
  }

  // 查看更多文章
  handleMoreBtn = () => {
    const { history } = this.props

    history.push('/archive/')
  }

  render() {
    const { data: { allMarkdownRemark: { edges } } } = this.props
    const posts = edges.map(edge => edge.node)

    return (
      <div className="page-index">
        <h2>RECENT</h2>
        <PostList posts={posts} history={this.props.history} />
        <div className="more-section">
          <Button type="circle" color="pink" onClick={this.handleMoreBtn}>
            MORE
          </Button>
        </div>
      </div>
    )
  }
}

export const query = graphql`
  query IndexPage {
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      limit: 9
    ) {
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            title
            cover
            date
            edate: date(formatString: "MMMM DD, YYYY")
            tags
            category
          }
          excerpt
        }
      }
    }
    site {
      siteMetadata {
        title
      }
    }
  }
`
