
export abstract class DateFunctions {
  static daysElapsed(timestamp: string): number {
    return (Date.now() - Date.parse(timestamp)) / (1000 * 60 * 60 * 24);
  }

  static midnightUTC(): Date {
    let date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }

  static daysAgoMidnightUTC(days: number): Date {
    let date = this.midnightUTC();
    date.setDate(date.getDate() - days);
    return date;
  }

}


// Interfacce per la tipizzazione del tuo JSON GeoJSON
export interface FeatureProperties {
  name: string;
  dialog_par: string[];
}

export interface Feature {
  properties: FeatureProperties;
  [key: string]: any; // Permette altre proprietà come geometry, type, ecc.
}

export interface GeoJsonInput {
  type: string;
  features: Feature[];
  [key: string]: any;
}

// Tipo per il valore di ritorno: array di coppie [string, string]
 export type RespondingPair = [string, string];


// Interface describing data stored
// in config_map_view.json local file,
// used to set map view in ol-map.component.ts.
// Every dataset describe:
// - coordinate center of the map view, in EPSG format;
// - flag to show/hide stations layers on the map;
// - flag to show/hide radar layers on the map;
// - zoom desired for the map.
// See config_map_view.json for further information.

export interface urlInfoInterface {
  coordinateCenter: number[];
  stationsYN: number;
  radarYN: number;
  zoomLevel: number;
}

// Class to implement local file access
// to retrieve:
// - device parameters management from config_stations.json;
// - UrlInfo from config_map_view.json.

export abstract class DeviceParameters
{
	
	// Member function to retrieve 
	// device sensor parameters shown in dialog for
	// every station clicked on the map.
	// The function download parameter's info
	// from configuration file 'config_stations.json'
	// in 'configuration' folder.
	// INPUT PARAMETER: device name (string)
	// RETURN VALUE: string array of parameters.
	
	static getSensorDialogPar (deviceName: string) : string[]
	{
		// Read configuration file from local server.
		const configStationJsonFile = require('./../assets/config_stations.json');

		// Return device name dialog parameters 
		// after a loop on features array to search
		// device name input parameter.
		// Exit when correspondent dialog parameters
		// are founded and takes corresponding properties dialog parameters.
		
		return configStationJsonFile.features.find((item:any)=>item.properties.name == deviceName).properties.dialog_par;
		
	}

	// Member function to retrieve 
	// station (device) list
	// from configuration file 'config_stations.json'
	// in 'configuration' folder.
	// INPUT PARAMETER: device name (string)
	// RETURN VALUE: string array.

	
	static getDeviceList () : string []
	{

		// Read configuration file from local server.
		const configStationJsonFile = require('./../assets/config_stations.json');

		let myDeviceList = [];

		// Loop on features array to search
		// all device .
		
		for (let i = 0; i < (configStationJsonFile.features).length; i++)
		{
			myDeviceList.push(configStationJsonFile.features[i].properties.name);
			
		}
		
		return myDeviceList;
		
	}
	
	/**
	 * Associa i parametri in input ai relativi "name" se presenti in "dialog_par".
	 * @param inputParams Array di stringhe da cercare (es. ["TEMP", "WDIR", "NON_ESISTO"])
	 * @returns Array di coppie ["name", "parametro"] o array vuoto se non ci sono corrispondenze
	 */

	static findMetadata(inputParams: string[]): RespondingPair[] {
	  const risultato: RespondingPair[] = [];

	// Read configuration file from local server.
	const configStationJsonFile = require('./../assets/config_stations.json');

	  // Scorre ogni stringa passata in input
	  for (const parametro of inputParams) {
		// Per ogni stringa, controlla tutte le features del JSON
		for (const feature of configStationJsonFile.features) {
		  const { name, dialog_par } = feature.properties;

		  // Se il parametro è incluso nell'array dialog_par, memorizza la coppia
		  if (dialog_par.includes(parametro)) {
			risultato.push([name, parametro]);
		  }
		}
	  }

	  return risultato;
	}	
	
	// Function to return UrlInfo from local file config_map_view.json
	// where are stored information about set map view.
	// Takes in input 'msv', an URL parameter,
	// load local configuration map file
	// and return an object 'urlInfoInterface'
	// setted with required fields.
	// If mscCode is not in configuration file,
	// return undefined.
	// Function used in OlMapComponent ngOnInit.
	
	static getUrlInfo (msvCode:string):urlInfoInterface | any
	{
		// Read configuration map file from local server.
		const configMapJsonFile = require('./../assets/config_map_view.json');
		
		return {
			coordinateCenter: configMapJsonFile.urlInfoList[Number(msvCode)].urlInfo.coordCenter,
			radarYN: configMapJsonFile.urlInfoList[Number(msvCode)].urlInfo.radarYesNo,
			stationsYN: configMapJsonFile.urlInfoList[Number(msvCode)].urlInfo.stationsYesNo,
			zoomLevel: configMapJsonFile.urlInfoList[Number(msvCode)].urlInfo.zoom,
		  } as urlInfoInterface;
		
	}
}

// -------------------------






