import _ from "underscore";

import { createSelector } from "reselect";
import { getMetadata } from "metabase/selectors/metadata";
import { LOAD_COMPLETE_FAVICON } from "metabase/hoc/Favicon";

import { getDashboardUiParameters } from "metabase/parameters/utils/dashboards";
import { getParameterMappingOptions as _getParameterMappingOptions } from "metabase/parameters/utils/mapping-options";

import { SIDEBAR_NAME } from "metabase/dashboard/constants";

import { getEmbedOptions, getIsEmbedded } from "metabase/selectors/embed";

import Question from "metabase-lib/Question";

import { isVirtualDashCard } from "./utils";

export const getDashboardId = state => state.dashboard.dashboardId;
export const getIsEditing = state => !!state.dashboard.isEditing;
export const getDashboardBeforeEditing = state => state.dashboard.isEditing;
export const getClickBehaviorSidebarDashcard = state => {
  const { sidebar, dashcards } = state.dashboard;
  return sidebar.name === SIDEBAR_NAME.clickBehavior
    ? dashcards[sidebar.props.dashcardId]
    : null;
};
export const getDashboards = state => state.dashboard.dashboards;
export const getDashcards = state => state.dashboard.dashcards;
export const getCardData = state => state.dashboard.dashcardData;
export const getSlowCards = state => state.dashboard.slowCards;
export const getParameterValues = state => state.dashboard.parameterValues;
export const getFavicon = state =>
  state.dashboard.loadingControls?.showLoadCompleteFavicon
    ? LOAD_COMPLETE_FAVICON
    : null;

export const getIsRunning = state =>
  state.dashboard.loadingDashCards.loadingStatus === "running";
export const getIsLoadingComplete = state =>
  state.dashboard.loadingDashCards.loadingStatus === "complete";

export const getLoadingStartTime = state =>
  state.dashboard.loadingDashCards.startTime;
export const getIsAddParameterPopoverOpen = state =>
  state.dashboard.isAddParameterPopoverOpen;

export const getSidebar = state => state.dashboard.sidebar;
export const getIsSharing = createSelector(
  [getSidebar],
  sidebar => sidebar.name === SIDEBAR_NAME.sharing,
);

export const getShowAddQuestionSidebar = createSelector(
  [getSidebar],
  sidebar => sidebar.name === SIDEBAR_NAME.addQuestion,
);

export const getIsShowDashboardInfoSidebar = createSelector(
  [getSidebar],
  sidebar => sidebar.name === SIDEBAR_NAME.info,
);

export const getDashboard = createSelector(
  [getDashboardId, getDashboards],
  (dashboardId, dashboards) => dashboards[dashboardId],
);

export const getLoadingDashCards = state => state.dashboard.loadingDashCards;

export const getDashCardById = (state, dashcardId) => {
  const dashcards = getDashcards(state);
  return dashcards[dashcardId];
};

export const getSingleDashCardData = (state, dashcardId) => {
  const dashcard = getDashCardById(state, dashcardId);
  const cardDataMap = getCardData(state);
  if (!dashcard || !cardDataMap) {
    return;
  }
  return cardDataMap?.[dashcard.id]?.[dashcard.card_id]?.data;
};

export const getDashCardTable = (state, dashcardId) => {
  const dashcard = getDashCardById(state, dashcardId);
  if (!dashcard || isVirtualDashCard(dashcard)) {
    return null;
  }
  const metadata = getMetadata(state);
  const question = new Question(dashcard.card, metadata);
  return question.table();
};

export const getDashboardComplete = createSelector(
  [getDashboard, getDashcards],
  (dashboard, dashcards) =>
    dashboard && {
      ...dashboard,
      ordered_cards: dashboard.ordered_cards
        .map(id => dashcards[id])
        .filter(dc => !dc.isRemoved),
    },
);

export const getDocumentTitle = state =>
  state.dashboard.loadingControls.documentTitle;

export const getIsBookmarked = (state, props) =>
  props.bookmarks.some(
    bookmark =>
      bookmark.type === "dashboard" && bookmark.item_id === props.dashboardId,
  );

export const getIsDirty = createSelector(
  [getDashboard, getDashcards],
  (dashboard, dashcards) =>
    !!(
      dashboard &&
      (dashboard.isDirty ||
        _.some(
          dashboard.ordered_cards,
          id =>
            !(dashcards[id].isAdded && dashcards[id].isRemoved) &&
            (dashcards[id].isDirty ||
              dashcards[id].isAdded ||
              dashcards[id].isRemoved),
        ))
    ),
);

export const getEditingDashcardId = createSelector([getSidebar], sidebar => {
  return sidebar?.props?.dashcardId;
});

export const getEditingParameterId = createSelector([getSidebar], sidebar => {
  return sidebar.name === SIDEBAR_NAME.editParameter
    ? sidebar.props?.parameterId
    : null;
});

export const getIsEditingParameter = createSelector(
  [getEditingParameterId],
  parameterId => parameterId != null,
);

export const getEditingParameter = createSelector(
  [getDashboard, getEditingParameterId],
  (dashboard, editingParameterId) =>
    editingParameterId != null
      ? _.findWhere(dashboard.parameters, { id: editingParameterId })
      : null,
);

const getCard = (state, props) => props.card;
const getDashCard = (state, props) => props.dashcard;

export const getParameterTarget = createSelector(
  [getEditingParameter, getCard, getDashCard],
  (parameter, card, dashcard) => {
    if (parameter == null) {
      return null;
    }
    const mapping = _.findWhere(dashcard.parameter_mappings, {
      parameter_id: parameter.id,
      ...(card && card.id && { card_id: card.id }),
    });
    return mapping && mapping.target;
  },
);

export const getParameters = createSelector(
  [getDashboardComplete, getMetadata],
  (dashboard, metadata) => {
    if (!dashboard || !metadata) {
      return [];
    }
    return getDashboardUiParameters(dashboard, metadata);
  },
);

export const makeGetParameterMappingOptions = () => {
  const getParameterMappingOptions = createSelector(
    [getMetadata, getEditingParameter, getCard, getDashCard],
    (metadata, parameter, card, dashcard) => {
      return _getParameterMappingOptions(metadata, parameter, card, dashcard);
    },
  );
  return getParameterMappingOptions;
};

export const getDefaultParametersById = createSelector(
  [getDashboard],
  dashboard =>
    ((dashboard && dashboard.parameters) || []).reduce((map, parameter) => {
      if (parameter.default) {
        map[parameter.id] = parameter.default;
      }

      return map;
    }, {}),
);

export const getIsHeaderVisible = createSelector(
  [getIsEmbedded, getEmbedOptions],
  (isEmbedded, embedOptions) => !isEmbedded || embedOptions.header,
);

export const getIsAdditionalInfoVisible = createSelector(
  [getIsEmbedded, getEmbedOptions],
  (isEmbedded, embedOptions) => !isEmbedded || embedOptions.additional_info,
);
