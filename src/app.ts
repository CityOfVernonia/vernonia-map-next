// import esri = __esri;

// esri config and auth
import esriConfig from '@arcgis/core/config';
import Portal from '@arcgis/core/portal/Portal';
import OAuthInfo from '@arcgis/core/identity/OAuthInfo';
import OAuthViewModel from './core/viewModels/OAuthViewModel';

// loading screen
import LoadingScreen from './core/widgets/LoadingScreen';

// map, view and layers
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Basemap from '@arcgis/core/Basemap';
import BingMapsLayer from '@arcgis/core/layers/BingMapsLayer';
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import GroupLayer from '@arcgis/core/layers/GroupLayer';

// popups
import TaxLotPopup from './core/popups/TaxLotPopup';
// import TaxMapPopup from './core/widgets/TaxMaps/TaxMapPopup';

// search
import SearchViewModel from '@arcgis/core/widgets/Search/SearchViewModel';
import LayerSearchSource from '@arcgis/core/widgets/Search/LayerSearchSource';

// the viewer
import Viewer from './core/Viewer';
import MarkupViewModel from './core/viewModels/MarkupViewModel';

// widgets
import LayerListLegend from './core/widgets/LayerListLegend';
import Measure from './core/widgets/Measure';
import Print from './core/widgets/Print';
// import TaxMaps from './core/widgets/TaxMaps';

// config portal and auth
esriConfig.portalUrl = 'https://gisportal.vernonia-or.gov/portal';

// app config and init loading screen
const title = 'Vernonia Map';

const loadingScreen = new LoadingScreen({
  title,
});

const portal = new Portal();

const oAuthViewModel = new OAuthViewModel({
  portal,
  oAuthInfo: new OAuthInfo({
    portalUrl: esriConfig.portalUrl,
    appId: 'L8fvJsX7U6RlN1Pt',
    popup: true,
  }),
});

/**
 * load app after auth successfully loaded
 */
const loadApp = (): void => {
  // layers
  const taxMaps = new MapImageLayer({
    portalItem: {
      id: '9c3b13af5a0b4fe7b57316d14259f893',
    },
    opacity: 0.5,
    listMode: 'hide',
    visible: true, // make sure
  });

  const taxMapBoundaries = new FeatureLayer({
    portalItem: {
      id: '5bbd874a1b4f4674a03ce5ba25e08bf2',
    },
    title: 'Tax Maps',
    visible: false,
    // popupTemplate: new TaxMapPopup(),
  });

  const soils = new FeatureLayer({
    visible: false,
    portalItem: {
      id: '1bb66a7c50714426967cadee1a753e0c',
    },
  });

  const wetlands = new GroupLayer({
    visible: false,
    title: 'Wetlands',
    layers: [
      new FeatureLayer({
        visible: false,
        title: 'Vernonia Artificial Wetlands',
        portalItem: {
          id: '73ba1a7ff19e42b38b3910b6d02beafb',
        },
      }),
      new FeatureLayer({
        visible: false,
        title: 'Vernonia LWI 2001',
        portalItem: {
          id: '5452cb87c2934546aa0ac48653231201',
        },
      }),
      new FeatureLayer({
        title: 'Oregon Wetlands',
        portalItem: {
          id: 'fa8d00ea829c40979b882d2af3b6ae76',
        },
      }),
    ],
  });

  const zoning = new FeatureLayer({
    visible: false,
    portalItem: {
      id: '4e24a499afc54717bd1695f9143bed44',
    },
  });

  const buildingFootprints = new FeatureLayer({
    visible: false,
    portalItem: {
      id: 'ffb2bf53ea0b4223bf271e560acb3a56',
    },
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

  const taxLots = new FeatureLayer({
    portalItem: {
      id: 'a6063eb199e640e0bbc2d5ceca23de9a',
    },
    opacity: 0.75,
    popupTemplate: new TaxLotPopup(),
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

  // view
  const view = new MapView({
    map: new Map({
      basemap: new Basemap({
        portalItem: {
          id: 'f36cd213cc934d2391f58f389fc9eaec',
        },
      }),
      layers: [
        taxMaps,
        soils,
        wetlands,
        zoning,
        buildingFootprints,
        floodHazard,
        taxLots,
        ugb,
        cityLimits,
        taxMapBoundaries,
      ],
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

  new Viewer({
    view,
    title,
    searchViewModel,
    oAuthViewModel,
    markupViewModel: new MarkupViewModel({ view }),
    nextBasemap: new Basemap({
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
    }),
    widgets: [
      {
        widget: new LayerListLegend({ view }),
        icon: 'layers',
        text: 'Layers',
      },
      {
        widget: new Measure({
          view,
        }),
        icon: 'measure',
        text: 'Measure',
      },
      {
        widget: new Print({
          view,
          printServiceUrl:
            'https://gisportal.vernonia-or.gov/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task',
        }),
        icon: 'print',
        text: 'Print',
      },
      // {
      //   widget: new TaxMaps({
      //     view,
      //     featureLayer: taxMapBoundaries,
      //     mapImageLayer: taxMaps,
      //   }),
      //   icon: 'map',
      //   text: 'Tax Maps',
      // },
    ],
  });

  view.when(() => {
    loadingScreen.end();
  });
};

const authLoadError = (error: any) => {
  console.log(error);

  const div = document.createElement('div');
  div.innerHTML = `
    <h3 style="margin-left: 1rem;">Authorization Error</h3>
    <p style="margin-left: 1rem;">Please reload page.</p>
    <p style="margin-left: 1rem;">If error continues contact please application maintainer.</p>
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
