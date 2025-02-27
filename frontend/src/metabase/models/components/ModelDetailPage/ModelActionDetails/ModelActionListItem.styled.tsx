import styled from "@emotion/styled";
import Button from "metabase/core/components/Button";
import Link from "metabase/core/components/Link";
import Icon from "metabase/components/Icon";
import { color } from "metabase/lib/colors";

export const ActionHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
`;

export const ActionTitle = styled(Link)`
  font-size: 1rem;
  font-weight: 700;
  color: ${color("text-dark")};
  cursor: ${props => (props.to ? "pointer" : "unset")};

  &:hover {
    color: ${props => props.to && color("brand")};
  }
`;

export const ActionSubtitle = styled.span`
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 0.875rem;
  color: ${color("text-medium")};
  margin-top: 4px;
`;

export const ActionSubtitlePart = styled.span`
  &:not(:last-child)::after {
    content: "·";
    margin-left: 6px;
    margin-right: 6px;
  }
`;

export const MenuIcon = styled(Icon)`
  color: ${color("text-dark")};
  cursor: pointer;

  &:hover {
    color: ${color("brand")};
  }
`;

export const ActionCard = styled.div`
  display: block;
  position: relative;

  padding: 1rem;
  margin-top: 0.75rem;
  border-radius: 6px;

  color: ${color("text-white")};
  background-color: ${color("text-dark")};
`;

export const CodeBlock = styled.pre`
  font-family: Monaco, monospace;
  font-size: 0.7rem;
  white-space: pre-wrap;
  margin: 0;
`;

export const ActionRunButtonContainer = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
`;

export const ActionRunButton = styled(Button)`
  background-color: ${color("bg-white")};
  color: ${color("text-dark")};
`;

export const ImplicitActionCardContentRoot = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const ImplicitActionMessage = styled.span`
  display: block;
  margin-top: 0.5rem;
`;
