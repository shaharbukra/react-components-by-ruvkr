import { useRef, useReducer, useCallback } from 'react';
import styled from 'styled-components';
import { rgba } from 'polished';
import { motion } from 'framer-motion';
import { useOutsideClick } from '../../hooks';
import { MenuItem, ControlItem } from './types';
import {
  EllipsisHorizontal,
  ChevronForward,
  ChevronBack,
  Close,
} from '../../assets/icons/essentials';
import { Container } from './Container';
import { Items } from './Items';

interface Props {
  name?: string;
  disabled?: boolean;
  icon?: JSX.Element;
  togglerIcon?: JSX.Element;
  items?: MenuItem[];
}

interface State {
  activeItems: MenuItem[];
  prevItems: MenuItem[][];
  forwardItems: MenuItem[][];
  show: boolean;
  mount: boolean;
  delayDirection: 1 | -1;
}

export const Menu: React.FC<Props> = ({
  name,
  icon,
  disabled = false,
  togglerIcon = <EllipsisHorizontal />,
  items = [],
}) => {
  const [state, dispatch] = useReducer(reducer, {
    activeItems: items,
    prevItems: [],
    forwardItems: [],
    show: false,
    mount: false,
    delayDirection: 1,
  });

  const {
    activeItems,
    prevItems,
    forwardItems,
    show,
    mount,
    delayDirection,
  } = state;

  const togglerShow = () => {
    if (!disabled && items.length > 0) {
      if (!show && !mount) dispatch({ mount: true });
      else if (show) dispatch({ show: false });
    }
  };

  const mountHandler = () => {
    if (!show) {
      dispatch({
        mount: false,
        activeItems: items,
        delayDirection: 1,
        prevItems: [],
        forwardItems: [],
      });
    }
  };

  const subActiveHandler = (items: MenuItem[]) => {
    dispatch({
      activeItems: items,
      prevItems: [...prevItems, activeItems],
      forwardItems: [],
    });
  };

  const prevHandler = () => {
    const active = prevItems.pop();
    dispatch({
      activeItems: active,
      prevItems,
      forwardItems: [...forwardItems, activeItems],
    });
  };

  const forwardHandler = () => {
    const active = forwardItems.pop();
    dispatch({
      activeItems: active,
      forwardItems,
      prevItems: [...prevItems, activeItems],
    });
  };

  const getDelayDirection = useCallback(direction => {
    dispatch({
      show: true,
      delayDirection: direction,
    });
  }, []);

  const togglerRef = useRef(null);
  const listeners = useOutsideClick(show, togglerShow);

  const control_items: ControlItem[] = [
    {
      id: 'back',
      icon: <ChevronBack />,
      disabled: prevItems.length === 0,
      onClick: prevHandler,
    },
    {
      id: 'forward',
      icon: <ChevronForward />,
      disabled: forwardItems.length === 0,
      onClick: forwardHandler,
    },
    {
      id: 'exit',
      icon: <Close />,
      onClick: togglerShow,
    },
  ];

  return (
    <ScContainer {...listeners}>
      <ScToggler ref={togglerRef} disabled={disabled} onClick={togglerShow}>
        <ScFocus tabIndex={-1}>
          {icon && <ScMenuIcon>{icon}</ScMenuIcon>}
          {name && <ScMenuName>{name}</ScMenuName>}
          <ScTogglerIcon animate={{ rotate: show ? 90 : 0 }}>
            {togglerIcon}
          </ScTogglerIcon>
        </ScFocus>
      </ScToggler>
      {mount && (
        <Container
          show={show}
          togglerRef={togglerRef}
          onAnimationComplete={mountHandler}
          getDelayDirection={getDelayDirection}
        >
          <Items
            show={show}
            items={activeItems}
            controlItems={control_items}
            onSubActive={subActiveHandler}
            delayDirection={delayDirection}
          />
        </Container>
      )}
    </ScContainer>
  );
};

const reducer = (state: State, payload: Partial<State>): State => ({
  ...state,
  ...payload,
});

const ScContainer = styled.div`
  display: inline-flex;
`;

const ScToggler = styled.button`
  font: inherit;
  border: none;
  background-color: transparent;
  padding: 0;
  display: flex;
  color: ${props => props.theme.col2};
  fill: ${props => props.theme.col2};
  cursor: pointer;

  &:focus,
  &:active {
    outline: none;
    & > div {
      background-color: ${p => rgba(p.theme.col2, 0.2)};
      transition: background-color 300ms ease-in-out;
    }
  }
  &:disabled {
    opacity: 0.2;
    cursor: not-allowed;
  }
  @media (hover: hover) and (pointer: fine) {
    &:hover:not(:disabled) {
      & > div {
        background-color: ${p => rgba(p.theme.col2, 0.2)};
        transition: background-color 300ms ease-in-out;
      }
    }
  }
`;

const ScFocus = styled.div`
  width: 100%;
  height: 100%;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  background-color: transparent;
  transition: background-color 300ms ease-in-out;

  &:focus,
  &:active {
    outline: none;
  }
`;

const ScTogglerIcon = styled(motion.div)`
  width: 20px;
  height: 20px;
`;

const ScMenuName = styled.div`
  text-align: left;
  margin-right: 8px;
`;

const ScMenuIcon = styled.div`
  width: 16px;
  height: 16px;
  margin-right: 8px;
`;
