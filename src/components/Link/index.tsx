import React from 'react'
import { Link as RebassLink, LinkProps } from 'rebass'
import { Link as RouterLink  } from 'react-router-dom'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { lighten, darken } from 'polished'

// LinkProps

export interface WrappedLinkProps extends LinkProps {
  external?: string
  children: React.ReactNode
  color?: string
}

const WrappedLink = ({ external, children, color,...rest }: WrappedLinkProps) => (
  <RebassLink
    target={external ?? '_blank'}
    rel={external ?? 'noopener noreferrer'}
    color= {color ? color :"#2f80ed" }
    {...rest}
  >
    {children}
  </RebassLink>
)

WrappedLink.propTypes = {
  external: PropTypes.bool,
}

const Link = styled(WrappedLink)`
  color: ${({ color, theme }) => (color ? color : theme.link)};
`

export default Link

export const CustomLink = styled(RouterLink)`
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  color: ${({ color, theme }) => (color ? color : theme.link)};

  &:visited {
    color: ${({ color, theme }) => (color ? lighten(0.1, color) : lighten(0.1, theme.link))};
  }

  &:hover {
    cursor: pointer;
    text-decoration: none;
    underline: none;
    color: ${({ color, theme }) => (color ? darken(0.1, color) : darken(0.1, theme.link))};
  }
`

export const BasicLink = styled(RouterLink)`
  text-decoration: none;
  color: ${({ theme }) => theme.text2};
  &:hover {
    cursor: pointer;
    text-decoration: none;
    underline: none;
  }
`
