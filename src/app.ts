/**
 * imports
 */
// esri config and auth
import esriConfig from '@arcgis/core/config';
import Portal from '@arcgis/core/portal/Portal';
import OAuthInfo from '@arcgis/core/identity/OAuthInfo';
import OAuthViewModel from './core/viewModels/OAuthViewModel';

// utils
import { watch } from '@arcgis/core/core/watchUtils';

// loading screen and disclaimer
import LoadingScreen from './core/widgets/LoadingScreen';
import DisclaimerModal from './core/widgets/DisclaimerModal';

// map, view and layers
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Basemap from '@arcgis/core/Basemap';
import BingMapsLayer from '@arcgis/core/layers/BingMapsLayer';
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';

// tax lot symbols
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer';
import { SimpleFillSymbol } from '@arcgis/core/symbols';
import Color from '@arcgis/core/Color';

// popups
import TaxLotPopup from './core/popups/TaxLotPopup';

// search
import SearchViewModel from '@arcgis/core/widgets/Search/SearchViewModel';
import LayerSearchSource from '@arcgis/core/widgets/Search/LayerSearchSource';

// the viewer
import Viewer from './core/layouts/Viewer';

import LayerListLegend from './core/widgets/LayerListLegend';
import Markup from './core/widgets/Markup';
import Print from './core/widgets/Print';
import TaxMaps from './core/widgets/TaxMaps';
import TaxLotSurveys from './core/widgets/TaxLotSurveys';
import Measure from './core/widgets/Measure';

import AddLayers from './core/widgets/AddLayers';

/**
 * config portal and auth
 */
esriConfig.portalUrl = 'https://gisportal.vernonia-or.gov/portal';
const portal = new Portal();

const oAuthViewModel = new OAuthViewModel({
  portal,
  oAuthInfo: new OAuthInfo({
    portalUrl: esriConfig.portalUrl,
    appId: 'L8fvJsX7U6RlN1Pt',
    popup: true,
  }),
});

const title = 'Vernonia Map';

const loadingScreen = new LoadingScreen({
  title,
});

/**
 * Load the app (oauth callback)
 * @param authed boolean
 */
const loadApp = (authed: boolean): void => {
  if (!authed && !DisclaimerModal.isAccepted()) {
    new DisclaimerModal();
  }

  // layers
  const nextBasemap = new Basemap({
    baseLayers: [
      new BingMapsLayer({
        style: 'aerial',
        key: 'Ao8BC5dsixV4B1uhNaUAK_ejjm6jtZ8G3oXQ5c5Q-WtmpORHOMklBvzqSIEXwdxe',
      }),
      new VectorTileLayer({
        portalItem: {
          id: 'f9a5da71cd61480680e456f0a3d4e1ce',
        },
      }),
    ],
    thumbnailUrl:
      'https://gisportal.vernonia-or.gov/portal/sharing/rest/content/items/b6130a13beb74026b89960fbd424021f/info/thumbnail/thumbnail1579125721359.png?f=json',
  });

  const zoning = new FeatureLayer({
    visible: false,
    portalItem: {
      id: '4e24a499afc54717bd1695f9143bed44',
    },
  });

  const taxLotsSymbol = new SimpleFillSymbol({
    color: [0, 0, 0, 0],
    outline: {
      color: [152, 114, 11, 1],
      width: 0.5,
    },
  });

  const taxLots = new FeatureLayer({
    portalItem: {
      id: 'a6063eb199e640e0bbc2d5ceca23de9a',
    },
    opacity: 0.75,
    popupTemplate: new TaxLotPopup(),
    renderer: new SimpleRenderer({
      symbol: taxLotsSymbol,
    }),
  });

  const cityLimits = new FeatureLayer({
    portalItem: {
      id: 'eb0c7507611e44b7923dd1c0167e3b92',
    },
  });

  const ugb = new FeatureLayer({
    portalItem: {
      id: '2f760ba990ab4d6e831d04b85a8a0bf3',
    },
    visible: false,
  });

  const floodHazard = new GroupLayer({
    portalItem: {
      id: '027c75b51e1048eaa0cdf760218ccdfc',
    },
    title: 'Flood Hazard',
    visible: false,
  });
  // the api doesn't apply default visibility
  floodHazard.when(() => {
    floodHazard.layers.forEach((layer, idx) => {
      if (idx !== 0) {
        layer.visible = false;
      }
    });
  });

  const taxMapsLayer = new MapImageLayer({
    portalItem: {
      id: '9c3b13af5a0b4fe7b57316d14259f893',
    },
    listMode: 'hide',
    legendEnabled: false,
    opacity: 0.4,
  });

  const taxMapBoundaries = new FeatureLayer({
    portalItem: {
      id: '5bbd874a1b4f4674a03ce5ba25e08bf2',
    },
    title: 'Tax Map Boundaries',
    visible: false,
  });

  // view
  const view = new MapView({
    map: new Map({
      basemap: new Basemap({
        portalItem: {
          id: 'f36cd213cc934d2391f58f389fc9eaec',
        },
      }),
      layers: [taxMapsLayer, zoning, floodHazard, taxLots, ugb, cityLimits, taxMapBoundaries],
      ground: 'world-elevation',
    }),
    zoom: 15,
    center: [-123.18291178267039, 45.8616094153766],
    constraints: {
      rotationEnabled: false,
    },
    popup: {
      dockEnabled: true,
      dockOptions: {
        position: 'bottom-left',
        breakpoint: false,
      },
    },
  });

  const searchViewModel = new SearchViewModel({
    searchAllEnabled: false,
    includeDefaultSources: false,
    sources: [
      new LayerSearchSource({
        layer: taxLots,
        outFields: ['*'],
        searchFields: ['ADDRESS'],
        suggestionTemplate: '{ADDRESS}',
        placeholder: 'Tax lot by address',
        name: 'Tax lot by address',
        zoomScale: 3000,
        filter: {
          where: 'BNDY_CLIPPED = 0',
        },
      }),
      new LayerSearchSource({
        layer: taxLots,
        outFields: ['*'],
        searchFields: ['OWNER'],
        suggestionTemplate: '{OWNER}',
        placeholder: 'Tax lot by owner',
        name: 'Tax lot by owner',
        zoomScale: 3000,
        filter: {
          where: 'BNDY_CLIPPED = 0',
        },
      }),
      new LayerSearchSource({
        layer: taxLots,
        outFields: ['*'],
        searchFields: ['ACCOUNT_IDS'],
        suggestionTemplate: '{ACCOUNT_IDS}',
        placeholder: 'Tax lot by tax account',
        name: 'Tax lot by tax account',
        zoomScale: 3000,
        filter: {
          where: 'BNDY_CLIPPED = 0',
        },
      }),
      new LayerSearchSource({
        layer: taxLots,
        outFields: ['*'],
        searchFields: ['TAXLOT_ID'],
        suggestionTemplate: '{TAXLOT_ID}',
        placeholder: 'Tax lot by map and lot',
        name: 'Tax lot by map and lot',
        zoomScale: 3000,
        filter: {
          where: 'BNDY_CLIPPED = 0',
        },
      }),
    ],
  });

  const markup = new Markup({ view });

  const addLayers = new AddLayers({
    view,
    layers: [
      {
        id: '17648051dc2145f9b2451486442a1778',
        // title: 'Vernonia Addresses',
        // snippet: 'City jurisdictional addresses.',
        add: (layer: esri.Layer) => {
          searchViewModel.sources.add(
            new LayerSearchSource({
              layer: layer,
              outFields: ['*'],
              searchFields: ['FULLADD'],
              suggestionTemplate: '{FULLADD}, {MAIL_CITY}, OR {ZIP}',
              placeholder: 'Vernonia addresses',
              name: 'Vernonia addresses',
              zoomScale: 3000,
            }),
          );
        }
      },
    ],
  });

  if (authed) {
    [
      {
        id: '99cb922f3519481eb8b67ecf0461612f',
        // title: 'wastewater',
      },
      {
        id: '8ad45fd25b7c4573929a4a6cba774ecf',
        // title: 'water',
      },
      {
        id: '100c699020a54c14ac89a23dbcb40560',
        // title: 'stormwater',
      },
    ].forEach((portalItem: any) => {
      addLayers.layers.push(portalItem);
    });
  }

  new Viewer({
    view,
    title,
    searchViewModel,
    oAuthViewModel,
    // markup,
    nextBasemap,
    uiWidgets: [
      {
        widget: new LayerListLegend({ view }),
        text: 'Layers',
        icon: 'layers',
      },
      {
        widget: new Measure({ view }),
        text: 'Measure',
        icon: 'measure',
      },
      {
        widget: markup,
        text: 'Markup',
        icon: 'pencil',
      },
      {
        widget: new Print({
          view,
          printServiceUrl:
            'https://gisportal.vernonia-or.gov/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task',
        }),
        text: 'Print',
        icon: 'print',
      },
      {
        widget: new TaxMaps({
          view,
          featureLayer: taxMapBoundaries,
          mapImageLayer: taxMapsLayer,
        }),
        text: 'Tax Maps',
        icon: 'color-coded-map',
      },
      {
        widget: new TaxLotSurveys({
          view,
          taxLotLayer: taxLots,
          surveysLayer: new FeatureLayer({
            url: 'https://gis.columbiacountymaps.com/server/rest/services/BaseData/Survey_Research/FeatureServer/0',
            outFields: ['*'],
          }),
        }),
        text: 'Tax Lot Surveys',
        icon: 'analysis',
      },
    ],
    menuWidgets: [
      {
        widget: addLayers,
        text: 'Add Layers',
        icon: 'add-layer',
      },
    ],
  });

  view.when(() => {
    loadingScreen.end();

    taxLots.when(() => {
      watch(view, 'map.basemap', (basemap: Basemap) => {
        taxLotsSymbol.outline.color =
          basemap === nextBasemap ? new Color([246, 213, 109, 1]) : new Color([152, 114, 11, 1]);
      });
    });
  });
};

/**
 * Error callback for portal and oauth
 * @param error
 */
const authLoadError = (error: any) => {
  console.log(error);

  const div = document.createElement('div');
  div.innerHTML = `
    <h3 style="margin-left: 1rem;">Application Error</h3>
    <p style="margin-left: 1rem;">Please reload page.</p>
    <p style="margin-left: 1rem;">If error continues contact the City.</p>
  `;
  document.body.append(div);
  loadingScreen.end();
};

portal
  .load()
  .then(() => {
    oAuthViewModel.load().then(loadApp).catch(authLoadError);
  })
  .catch(authLoadError);
