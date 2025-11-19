import { defineSettings, type CheckboxSetting, type RangeSetting, type SelectSetting } from "./settings_definition";

export interface LayoutSettings {
    galleryZoom: RangeSetting;
    showBorders: CheckboxSetting;
    showObservedTag: CheckboxSetting;
    showBirdNames: CheckboxSetting;

    showMapVisitedMarkers: CheckboxSetting;
    
    fullscreenGalleryGalleryBehavior: SelectSetting<"directly" | "manually">;
    fullscreenGalleryMapBehavior: SelectSetting<"directly" | "manually">;
    includeObservationImagesInGallery: CheckboxSetting;
}

export function getSettingsDefinition() {
    return defineSettings([
        {
            name: "Gallerie Einstellungen",
            settings: {
                galleryZoom: {
                    type: "range",
                    label: "Bilder pro Zeile",
                    default: 4,
                    min: 2,
                    max: 8,
                    stepSize: 1,
                    helpText: "Anzahl der Bilder, die pro Zeile in der Gallerie angezeigt werden sollen.",
                },
                showBorders: {
                    type: "checkbox",
                    label: "Bildränder anzeigen",
                    default: true,
                    helpText: "Ob Ränder um die Bilder in der Gallerie angezeigt werden sollen.",
                },
                showObservedTag: {
                    type: "checkbox",
                    label: "Beobachtet-Markierung anzeigen",
                    default: true,
                    helpText:
                        "Ob ein 'Beobachtet'-Tag auf den Bildern angezeigt werden soll, für die Beobachtungen vorliegen.",
                },
                showBirdNames: {
                    type: "checkbox",
                    label: "Vogelarten-Namen anzeigen",
                    default: true,
                    helpText: "Ob die Namen der Vogelarten unter den Bildern in der Gallerie angezeigt werden sollen.",
                },
            },
        },
        {
            name: "Karten Einstellungen",
            settings: {
                showMapVisitedMarkers: {
                    type: "checkbox",
                    label: "Besuchte Beobachtungen anzeigen",
                    default: true,
                    helpText:
                        "Ob auf der Karte Markierungen für bereits besuchte Beobachtungen angezeigt werden sollen.",
                },
            },
        },
        {
            name: "Präsentation",
            settings: {
                fullscreenGalleryGalleryBehavior: {
                    type: "select",
                    label: "Vollbild-Gallerie Verhalten (Gallerie)",
                    default: "directly",
                    options: [
                        { value: "directly", label: "Direkt öffnen" },
                        { value: "manually", label: "Manuell öffnen" },
                    ],
                    helpText:
                        "Legt fest, ob die Vollbild-Gallerie automatisch beim Start der Präsentation geöffnet werden soll oder ob sie manuell geöffnet werden muss.",
                },
                fullscreenGalleryMapBehavior: {
                    type: "select",
                    label: "Vollbild-Gallerie Verhalten (Karte)",
                    default: "manually",
                    options: [
                        { value: "directly", label: "Direkt öffnen" },
                        { value: "manually", label: "Manuell öffnen" },
                    ],
                    helpText:
                        "Legt fest, ob die Vollbild-Gallerie automatisch beim Wechsel zur Kartenansicht geöffnet werden soll oder ob sie manuell geöffnet werden muss.",
                },
                includeObservationImagesInGallery: {
                    type: "checkbox",
                    label: "Beobachtungsbilder in Gallerie einbeziehen",
                    default: true,
                    helpText: "Ob Bilder von Beobachtungen in der Gallerie der Präsentation einbezogen werden sollen.",
                },

            },
        },
    ]);
}
