import React, { useCallback, useState, ReactNode } from 'react'
import styled from 'styled-components'
import Popover, { PopoverProps } from '../Popover'

const TooltipContainer = styled.div`
  width: 360px;
  padding: 0.6rem 0.8rem;
  line-height: 150%;
  font-weight: 400;
  font-size: 0.9rem;
`

interface TooltipProps extends Omit<PopoverProps, 'content'> {
  text?: string
  info?: JSX.Element
}

interface TooltipPropsNew extends Omit<PopoverProps, 'content'> {
  text: ReactNode
  disableHover?: boolean // disable the hover and content display
}

interface TooltipContentProps extends Omit<PopoverProps, 'content'> {
  content: ReactNode
  onOpen?: () => void
  // whether to wrap the content in a `TooltipContainer`
  wrap?: boolean
  disableHover?: boolean // disable the hover and content display
}

export default function Tooltip({ text, info, ...rest }: TooltipProps) {
  return <Popover content={<TooltipContainer><b>{text}</b> {info}</TooltipContainer>} {...rest} />
}

export function TooltipNew({ text, ...rest }: TooltipPropsNew) {
  return <Popover content={text && <TooltipContainer>{text}</TooltipContainer>} {...rest} />
}

function TooltipContent({ content, wrap = false, ...rest }: TooltipContentProps) {
  return <Popover content={wrap ? <TooltipContainer>{content}</TooltipContainer> : content} {...rest} />
}

export function MouseoverTooltip({ children, ...rest }: Omit<TooltipProps, 'show'>) {
  const [show, setShow] = useState(false)
  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])
  return (
    <Tooltip {...rest} show={show}>
      <div onMouseEnter={open} onMouseLeave={close}>
        {children}
      </div>
    </Tooltip>
  )
}

/** Standard text tooltip. */
export function MouseoverTooltipNew({ text, disableHover, children, ...rest }: Omit<TooltipPropsNew, 'show'>) {
  const [show, setShow] = useState(false)
  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])
  return (
    <TooltipNew {...rest} show={show} text={disableHover ? null : text}>
      <div onMouseEnter={open} onMouseLeave={close}>
        {children}
      </div>
    </TooltipNew>
  )
}

/** Tooltip that displays custom content. */
export function MouseoverTooltipContent({
  content,
  children,
  onOpen: openCallback = undefined,
  disableHover,
  ...rest
}: Omit<TooltipContentProps, 'show'>) {
  const [show, setShow] = useState(false)
  const open = useCallback(() => {
    setShow(true)
    openCallback?.()
  }, [openCallback])
  const close = useCallback(() => setShow(false), [setShow])
  return (
    <TooltipContent {...rest} show={show} content={disableHover ? null : content}>
      <div
        style={{ display: 'inline-block', lineHeight: 0, padding: '0.25rem' }}
        onMouseEnter={open}
        onMouseLeave={close}
      >
        {children}
      </div>
    </TooltipContent>
  )
}

