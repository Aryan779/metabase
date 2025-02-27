import React, { useState, useEffect } from "react";
import { usePrevious } from "react-use";

import { t } from "ttag";

import Input from "metabase/core/components/Input";
import SearchResults from "metabase/nav/components/SearchResults";
import TippyPopover from "metabase/components/Popover/TippyPopover";
import Ellipsified from "metabase/core/components/Ellipsified";

import type {
  DashboardOrderedCard,
  LinkCardSettings,
  UnrestrictedLinkEntity,
} from "metabase-types/api";

import { useToggle } from "metabase/hooks/use-toggle";
import Search from "metabase/entities/search";

import { isEmpty } from "metabase/lib/validate";

import { isRestrictedLinkEntity } from "metabase-types/guards/dashboard";
import { EntityDisplay } from "./EntityDisplay";
import { settings } from "./LinkVizSettings";

import {
  EditLinkCardWrapper,
  DisplayLinkCardWrapper,
  CardLink,
  SearchResultsContainer,
  BrandIconWithHorizontalMargin,
} from "./LinkViz.styled";

import { isUrlString } from "./utils";

export interface LinkVizProps {
  dashcard: DashboardOrderedCard;
  isEditing: boolean;
  onUpdateVisualizationSettings: (
    newSettings: Partial<DashboardOrderedCard["visualization_settings"]>,
  ) => void;
  settings: DashboardOrderedCard["visualization_settings"] & {
    link: LinkCardSettings;
  };
}

function LinkViz({
  dashcard,
  isEditing,
  onUpdateVisualizationSettings,
  settings,
}: LinkVizProps) {
  const {
    link: { url, entity },
  } = settings;

  const isNew = !!dashcard?.justAdded;
  const [autoFocus, setAutoFocus] = useState(isNew);
  const previousUrl = usePrevious(url);

  const handleLinkChange = (newLink: string) =>
    onUpdateVisualizationSettings({ link: { url: newLink } });

  const handleEntitySelect = (entity: UnrestrictedLinkEntity) => {
    onUpdateVisualizationSettings({
      link: {
        entity: {
          id: entity.id,
          db_id: entity.model === "table" ? entity.database_id : undefined,
          name: entity.name,
          model: entity.model,
          description: entity.description,
          display: entity.display,
        },
      },
    });
  };

  const [inputIsFocused, { turnOn: onFocusInput, turnOff: onBlurInput }] =
    useToggle();

  useEffect(() => {
    // if the url was auto-filled from the entity, focus the input
    if (previousUrl === undefined && !!url) {
      setAutoFocus(true);
    }
  }, [previousUrl, url]);

  if (entity) {
    if (isRestrictedLinkEntity(entity)) {
      return (
        <EditLinkCardWrapper>
          <EntityDisplay entity={entity} />
        </EditLinkCardWrapper>
      );
    }

    const wrappedEntity = Search.wrapEntity({
      ...entity,
      database_id: entity.db_id ?? entity.database_id,
      table_id: entity.model === "table" ? entity.id : undefined,
      collection: {},
    });

    if (isEditing) {
      return (
        <EditLinkCardWrapper>
          <EntityDisplay entity={wrappedEntity} showDescription={false} />
        </EditLinkCardWrapper>
      );
    }

    return (
      <DisplayLinkCardWrapper>
        <CardLink to={wrappedEntity.getUrl()} target="_blank" rel="noreferrer">
          <EntityDisplay entity={wrappedEntity} showDescription />
        </CardLink>
      </DisplayLinkCardWrapper>
    );
  }

  if (isEditing) {
    return (
      <EditLinkCardWrapper>
        <TippyPopover
          visible={!!url?.length && inputIsFocused && !isUrlString(url)}
          content={
            <SearchResultsContainer>
              <SearchResults
                searchText={url?.trim()}
                onEntitySelect={handleEntitySelect}
              />
            </SearchResultsContainer>
          }
          placement="bottom"
        >
          <Input
            fullWidth
            value={url ?? ""}
            autoFocus={autoFocus}
            placeholder={"https://example.com"}
            onChange={e => handleLinkChange(e.target.value)}
            onFocus={onFocusInput}
            onBlur={onBlurInput}
            // the dashcard really wants to turn all mouse events into drag events
            onMouseDown={e => e.stopPropagation()}
          />
        </TippyPopover>
      </EditLinkCardWrapper>
    );
  }

  const urlIcon = isEmpty(url) ? "question" : "link";

  return (
    <DisplayLinkCardWrapper>
      <CardLink to={url ?? ""} target="_blank" rel="noreferrer">
        <BrandIconWithHorizontalMargin name={urlIcon} />
        <Ellipsified>{!isEmpty(url) ? url : t`Choose a link`}</Ellipsified>
      </CardLink>
    </DisplayLinkCardWrapper>
  );
}

export default Object.assign(LinkViz, settings);
