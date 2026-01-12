import { RuleDefinition, BimStats } from './types';

export const COLAB_PYTHON_SCRIPT = `# -*- coding: utf-8 -*-
"""
BIM-GIS Modular Platform - Core Logic
Generated for Google Colab Execution
"""

import sys
import subprocess
import math

# 1. Environment Setup (Simulation for Colab)
def install_dependencies():
    print("Installing dependencies...")
    packages = ["ifcopenshell", "shapely", "numpy", "geopandas"]
    for package in packages:
        try:
            __import__(package)
        except ImportError:
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
    print("Dependencies installed.")

# Uncomment the line below to run installation in Colab
# install_dependencies()

import ifcopenshell
import ifcopenshell.util.element
from ifcopenshell.util.selector import Selector
from abc import ABC, abstractmethod

# 2. Rule Engine Core
class BaseRule(ABC):
    def __init__(self, name, description, category):
        self.name = name
        self.description = description
        self.category = category 

    @abstractmethod
    def check(self, model):
        pass

# 3. Implementation of Specific Rules

class CorridorWidthRule(BaseRule):
    def __init__(self):
        super().__init__("Corridor Width Check", "Corridor width must be >= 1.2m", "Safety")
        self.min_width = 1200.0 # mm

    def check(self, model):
        results = []
        selector = Selector()
        # Finding spaces that act as corridors
        # In a real scenario, this might use classification references
        corridors = selector.parse(model, 'IfcSpace[LongName *= "Corridor"]')
        
        if not corridors:
             # Fallback for demo if no specific corridors found
             print(f"No specific 'Corridor' spaces found. Checking all spaces for demo.")
             corridors = model.by_type("IfcSpace")

        for corridor in corridors:
            psets = ifcopenshell.util.element.get_psets(corridor)
            width = psets.get("Pset_SpaceCommon", {}).get("ClearWidth") # Standard Property
            
            # Fallback: Geometry calculation simulation
            if width is None:
                width = self.calculate_geometry_width(corridor)
            
            status = width >= self.min_width
            msg = f"Width: {width:.2f}mm (Required: {self.min_width}mm)"
            
            results.append({
                'id': corridor.GlobalId, 
                'status': 'Pass' if status else 'Fail', 
                'message': msg
            })
        return results

    def calculate_geometry_width(self, element):
        # Placeholder for complex Shapely geometry analysis
        # In production: Extract footprint, find Minor Axis of Oriented Bounding Box
        return 1500.0  # Mock return value for demo

class SunlightAccessRule(BaseRule):
    def __init__(self):
        super().__init__("Sunlight Access Check", "Building height relative to north lot line distance", "Legal")
    
    def check(self, model):
        results = []
        # 1. Extract Max Height (BIM)
        max_z = self.get_max_height(model)
        
        # 2. GIS Logic (Mocked for pure Python script)
        # In production: Load Site Polygon from GeoPandas, Calculate Distance
        distance_to_north_lot = 10.0 # meters (Mock)
        allowed_height = distance_to_north_lot * 2 # Legal ratio 1:2
        
        status = max_z <= allowed_height
        msg = f"Height: {max_z}m (Allowed: {allowed_height}m based on {distance_to_north_lot}m distance)"
        
        results.append({
            'id': 'BUILDING_ROOT', 
            'status': 'Pass' if status else 'Fail', 
            'message': msg
        })
        return results
        
    def get_max_height(self, model):
        # Extract all building storeys and find max elevation + height
        storeys = model.by_type("IfcBuildingStorey")
        max_h = 0.0
        for s in storeys:
            elev = s.Elevation if s.Elevation else 0
            max_h = max(max_h, elev)
        return max_h + 3.0 # Add 3m for roof estimation

# 4. Main Execution
def main():
    print("--- Starting Modular Platform Self-Check ---")
    
    # Create a dummy model if no file provided
    model = ifcopenshell.file()
    project = model.createIfcProject(ifcopenshell.guid.new(), None, "Demo Project")
    
    # Create a dummy space for testing
    space = model.createIfcSpace(ifcopenshell.guid.new(), None, "Corridor 101", "Corridor", None, None, None, None, "ELEMENT", None, None)
    
    # Run Rules
    rules = [CorridorWidthRule(), SunlightAccessRule()]
    
    for rule in rules:
        print(f"\\nRunning Rule: {rule.name}")
        results = rule.check(model)
        for res in results:
            print(f" - [{res['status']}] ID: {res['id']} | {res['message']}")

if __name__ == "__main__":
    main()
`;

export const APP_RULES: RuleDefinition[] = [
  { id: 'R01', name: 'Corridor Width Check', description: 'Minimum clear width of 1.2m for public corridors.', category: 'Safety' },
  { id: 'R02', name: 'Sunlight Access Control', description: 'Height restriction based on distance to northern lot line.', category: 'Legal' },
  { id: 'R03', name: 'Parking Bay Dimensions', description: 'Standard parking bay must be 2.5m x 5.0m.', category: 'Parking' },
  { id: 'R04', name: 'Fire Exit Distance', description: 'Maximum travel distance to nearest exit < 30m.', category: 'Safety' },
];

export const MOCK_BIM_STATS: BimStats = {
  totalElements: 1240,
  warnings: 12,
  errors: 3,
  complianceRate: 97.5,
};