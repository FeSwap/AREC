import React, { useCallback, useState } from 'react'
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

export default function Tooltip({ text, info, ...rest }: TooltipProps) {
  return <Popover content={<TooltipContainer><b>{text}</b> {info}</TooltipContainer>} {...rest} />
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
