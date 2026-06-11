import { Component, OnInit } from '@angular/core';
import { MatLegacyRadioChange as MatRadioChange } from '@angular/material/legacy-radio';
import { MatLegacySlideToggleChange as MatSlideToggleChange } from '@angular/material/legacy-slide-toggle';
import BaseLayer from 'ol/layer/Base';
import { LayersService } from '../services/layers.service';
import { ErddapService } from 'src/app/services/erddap.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-layer-switcher',
  templateUrl: './layer-switcher.component.html',
  styleUrls: ['./layer-switcher.component.scss'],
})
export class LayerSwitcherComponent implements OnInit {
  layers: BaseLayer[];
  isCollapsed: boolean = false;

  isDropupOpen = false;
  focusedItemIndex = -1;
  
  // Lista dei metadati reali
  dropupItems = ['Water temperature', 'Metadata2', 'Metadata3', 'Metadata4'];

  // Traccia gli elementi selezionati con la spunta
  selectedMetadata = new Set<string>();

  // Controlla la visibilità del blocco "Metadata"
  showMetadata: boolean = false; 

  constructor(service: LayersService, public erdappService: ErddapService, private breakpointObserver: BreakpointObserver) {
    this.layers = service.layers;
  }
	
	ngOnInit(): void 
	{
		// 1. Rilevamento automatico del dispositivo tramite BreakpointObserver
		this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet]).subscribe(result =>
		{
			if(!result.matches)
				this.isCollapsed = false;
			else
				this.isCollapsed = true;
		});

		// 2. CONTROLLO AL CARICAMENTO: Verifica se "Real Time Stations" è già attivo di default
		if (this.layers && this.layers.length > 0) {
			const rtLayer = this.layers.find(layer => layer.get('name') === "Real Time Stations");
			if (rtLayer) {
				this.showMetadata = rtLayer.getVisible();
			}
		}
	} // end ngOnInit    
	

  onChange(event: MatSlideToggleChange, index: number): void {
    this.layers[index].setVisible(event.checked);
	if (this.layers[index].get('name') == "Real Time Stations")
	{
		var divCircle = document.getElementById('idActiveStationLegend') as HTMLElement;
		if (divCircle) {
			divCircle.hidden = !event.checked;
		}
		
		// Mostra il menu Metadata solo se il layer delle stazioni è attivo
		this.showMetadata = event.checked;

		// Chiude in sicurezza la tendina se l'utente spegne il layer principale
		if (!event.checked) {
			this.closeDropup();
		}
	}
  }

  onChangeBaseLayer(event: MatRadioChange): void {
    this.layers.filter(this.isBaseLayer).forEach(element => {
      element.setVisible(false);
    });
    this.layers[event.value].setVisible(event.source.checked);
  }

  isBaseLayer(layer: BaseLayer): boolean {
    return layer.get('base');
  }

  toggleDropup(): void {
    this.isDropupOpen = !this.isDropupOpen;
    if (!this.isDropupOpen) {
      this.focusedItemIndex = -1;
    }
  }

  closeDropup(): void {
    this.isDropupOpen = false;
    this.focusedItemIndex = -1;
  }

  selectItem(item: string): void {
    if (item === 'Select All') {
      this.dropupItems.forEach(i => this.selectedMetadata.add(i));
      console.log('Selezionati tutti i metadati');
    } else if (item === 'Deselect All') {
      this.selectedMetadata.clear();
      console.log('Deselezionati tutti i metadati');
    } else {
      if (this.selectedMetadata.has(item)) {
        this.selectedMetadata.delete(item);
        console.log(`Deselezionato: ${item}`);
      } else {
        this.selectedMetadata.add(item);
        console.log(`Selezionato: ${item}`);
      }
    }
  }

  handleKeyDown(event: KeyboardEvent): void {
    const totalItemsCount = this.dropupItems.length + 2;

    if (!this.isDropupOpen) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowUp') {
        event.preventDefault();
        this.isDropupOpen = true;
        this.focusedItemIndex = 0;
        this.focusDropdownItem();
      }
      return;
    }

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.closeDropup();
        const trigger = document.getElementById('provaMenuTrigger');
        if (trigger) trigger.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.focusedItemIndex = (this.focusedItemIndex + 1) % totalItemsCount;
        this.focusDropdownItem();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusedItemIndex = this.focusedItemIndex <= 0 ? totalItemsCount - 1 : this.focusedItemIndex - 1;
        this.focusDropdownItem();
        break;
      case 'Tab':
        this.closeDropup();
        break;
    }
  }

  private focusDropdownItem(): void {
    setTimeout(() => {
      const elements = document.querySelectorAll('.dropup-item');
      if (elements && elements[this.focusedItemIndex]) {
        (elements[this.focusedItemIndex] as HTMLElement).focus();
      }
    }, 0);
  }
}
