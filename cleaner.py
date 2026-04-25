"""
Module de nettoyage pour offres d'emploi (ReKrute et autres sites)
VERSION CORRIGÉE - Gère les doublons de colonnes
"""

import pandas as pd
import json
import re
import os
from datetime import datetime
from typing import Dict, List, Optional

class JobOfferCleaner:
    """
    Classe spécialisée pour le nettoyage des offres d'emploi
    """
    
    def __init__(self):
        self.rapport = {
            'raw_count': 0,
            'cleaned_count': 0,
            'removed_duplicates': 0,
            'removed_empty': 0,
            'fixed_fields': {}
        }
        
    def load_json_data(self, filepath: str) -> pd.DataFrame:
        """
        Charge les données JSON (supporte fichiers multiples)
        """
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Si c'est une liste d'offres
            if isinstance(data, list):
                df = pd.DataFrame(data)
            # Si c'est un dictionnaire avec une clé 'offers'
            elif isinstance(data, dict) and 'offers' in data:
                df = pd.DataFrame(data['offers'])
            else:
                df = pd.DataFrame([data])
            
            print(f"✅ Chargé {len(df)} offres depuis {filepath}")
            self.rapport['raw_count'] += len(df)
            return df
            
        except Exception as e:
            print(f"❌ Erreur chargement {filepath}: {e}")
            return pd.DataFrame()
    
    def clean_title(self, title: str) -> str:
        """
        Nettoie le titre de l'offre
        """
        if pd.isna(title) or not title:
            return ""
        
        # Nettoyage de base
        title = str(title)
        title = title.strip()
        title = re.sub(r'\s+', ' ', title)  # Espaces multiples
        title = re.sub(r'\([^)]*\)', '', title)  # Supprime (H/F), (Maroc), etc.
        title = re.sub(r'\|[^|]*$', '', title)  # Supprime | Casablanca
        title = re.sub(r'[|]', '', title)  # Supprime les | restants
        
        # Normalisation
        title = title.replace('H/F', '').replace('h/f', '').strip()
        title = title.replace('|', '').strip()
        
        # Mise en forme
        title = title.title()  # Première lettre de chaque mot en majuscule
        
        # Correction spécifiques
        corrections = {
            'Développeur': 'Développeur',
            'Developpeur': 'Développeur',
            'Ingenieur': 'Ingénieur',
            'Ingénieur': 'Ingénieur',
            'Comptable': 'Comptable',
            'Commercial': 'Commercial'
        }
        
        for old, new in corrections.items():
            title = title.replace(old, new)
        
        return title
    
    def clean_company(self, company: str) -> str:
        """
        Nettoie le nom de l'entreprise
        """
        if pd.isna(company) or not company:
            return "Non spécifié"
        
        company = str(company).strip()
        company = re.sub(r'\s+', ' ', company)
        
        # Entreprises spécifiques à normaliser
        company_mapping = {
            'confidentiel': 'Confidentiel',
            'Confidentiel': 'Confidentiel',
            'CONFIDENTIEL': 'Confidentiel'
        }
        
        for old, new in company_mapping.items():
            if company.lower() == old.lower():
                return new
        
        # Capitalisation
        company = company.title()
        
        return company
    
    def clean_region(self, region: str) -> Dict[str, str]:
        """
        Nettoie et extrait la région, ville et pays
        """
        result = {
            'city': '',
            'region_admin': '',  # Changé de 'region' à 'region_admin' pour éviter doublon
            'country': 'Maroc'
        }
        
        if pd.isna(region) or not region:
            return result
        
        region = str(region).strip()
        region = re.sub(r'\([^)]*\)', '', region)  # Supprime (Maroc)
        region = region.replace('|', '').strip()
        
        # Liste des villes marocaines
        moroccan_cities = [
            'Casablanca', 'Rabat', 'Tanger', 'Marrakech', 'Fès', 
            'Agadir', 'Meknès', 'Oujda', 'Kénitra', 'Tétouan',
            'Salé', 'Nador', 'Safi', 'El Jadida', 'Beni Mellal',
            'Laayoune', 'Taza', 'Settat', 'Mohammedia', 'Khouribga',
            'Berrechid', 'Témara', 'Guelmim', 'Khemisset', 'Errachidia'
        ]
        
        # Extraire la ville
        for city in moroccan_cities:
            if city.lower() in region.lower():
                result['city'] = city
                break
        
        # Extraire la région administrative
        regions_mapping = {
            'casa': 'Casablanca-Settat',
            'rabat': 'Rabat-Salé-Kénitra',
            'tanger': 'Tanger-Tétouan-Al Hoceïma',
            'marrakech': 'Marrakech-Safi',
            'fès': 'Fès-Meknès',
            'agadir': 'Souss-Massa'
        }
        
        for key, region_name in regions_mapping.items():
            if key in region.lower():
                result['region_admin'] = region_name
                break
        
        return result
    
    def extract_metadata(self, title: str) -> Dict[str, str]:
        """
        Extrait des métadonnées du titre (contrat, seniorité, etc.)
        """
        metadata = {
            'contract_type': '',
            'seniority': '',
            'category': ''
        }
        
        if not title:
            return metadata
        
        title_lower = title.lower()
        
        # Type de contrat
        contract_keywords = {
            'CDI': ['cdi', 'permanent'],
            'CDD': ['cdd', 'temporaire', 'déterminé'],
            'Stage': ['stage', 'internship'],
            'Alternance': ['alternance', 'apprentissage'],
            'Freelance': ['freelance', 'indépendant']
        }
        
        for contract, keywords in contract_keywords.items():
            if any(keyword in title_lower for keyword in keywords):
                metadata['contract_type'] = contract
                break
        
        # Niveau de seniorité
        seniority_keywords = {
            'Junior': ['junior', 'débutant', 'jeune diplômé'],
            'Senior': ['senior', 'confirmé', 'expérimenté'],
            'Manager': ['manager', 'directeur', 'lead', 'chef'],
            'Executive': ['executive', 'directeur général']
        }
        
        for level, keywords in seniority_keywords.items():
            if any(keyword in title_lower for keyword in keywords):
                metadata['seniority'] = level
                break
        
        # Catégorie de poste
        category_keywords = {
            'IT': ['développeur', 'dev', 'data', 'python', 'java', 'javascript', 'it', 'informatique', 'full stack'],
            'Finance': ['comptable', 'finance', 'audit', 'contrôleur', 'gestion'],
            'Commercial': ['commercial', 'vente', 'business', 'account manager', 'sales'],
            'Marketing': ['marketing', 'digital', 'community', 'social media', 'seo', 'content'],
            'RH': ['rh', 'ressources humaines', 'recrutement', 'formation'],
            'Logistique': ['logistic', 'supply chain', 'transport', 'magasinier'],
            'Technique': ['technicien', 'maintenance', 'ingenieur', 'production']
        }
        
        for category, keywords in category_keywords.items():
            if any(keyword in title_lower for keyword in keywords):
                metadata['category'] = category
                break
        
        return metadata
    
    def normalize_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Applique tous les nettoyages au DataFrame
        """
        print("\n🔄 Début du nettoyage...")
        
        # 1. Suppression des doublons
        initial_count = len(df)
        # Vérifier si la colonne 'url' existe
        if 'url' in df.columns:
            df = df.drop_duplicates(subset=['url'], keep='first')
        else:
            print("   ⚠️ Colonne 'url' non trouvée, saut de la déduplication")
        self.rapport['removed_duplicates'] = initial_count - len(df)
        print(f"   • Suppression doublons: {self.rapport['removed_duplicates']} offres enlevées")
        
        # 2. Suppression des lignes sans titre valide
        initial_count = len(df)
        if 'title' in df.columns:
            df = df[df['title'].notna() & (df['title'].str.strip() != '')]
        else:
            # Si 'title' n'existe pas, essayer 'titre' ou d'autres noms
            title_col = next((col for col in df.columns if 'title' in col.lower() or 'titre' in col.lower()), None)
            if title_col:
                df = df[df[title_col].notna() & (df[title_col].str.strip() != '')]
        self.rapport['removed_empty'] = initial_count - len(df)
        print(f"   • Suppression titres vides: {self.rapport['removed_empty']} offres enlevées")
        
        # 3. Nettoyage du titre
        if 'title' in df.columns:
            df['clean_title'] = df['title'].apply(self.clean_title)
        else:
            # Chercher une colonne similaire
            title_col = next((col for col in df.columns if 'title' in col.lower() or 'titre' in col.lower()), None)
            if title_col:
                df['clean_title'] = df[title_col].apply(self.clean_title)
        print(f"   • Nettoyage des titres effectué")
        
        # 4. Nettoyage de l'entreprise
        company_col = next((col for col in df.columns if 'company' in col.lower() or 'entreprise' in col.lower()), None)
        if company_col:
            df['clean_company'] = df[company_col].apply(self.clean_company)
        
        # 5. Extraction métadonnées
        title_col_clean = 'title' if 'title' in df.columns else next((col for col in df.columns if 'title' in col.lower()), None)
        if title_col_clean:
            metadata_df = df[title_col_clean].apply(self.extract_metadata).apply(pd.Series)
            df = pd.concat([df, metadata_df], axis=1)
        
        # 6. Nettoyage région/ville
        region_col = next((col for col in df.columns if 'region' in col.lower() or 'lieu' in col.lower() or 'location' in col.lower()), None)
        if region_col:
            region_data = df[region_col].apply(self.clean_region).apply(pd.Series)
            df = pd.concat([df, region_data], axis=1)
        else:
            df['city'] = ''
            df['region_admin'] = ''
            df['country'] = 'Maroc'
        
        # 7. Ajout de métadonnées temporelles
        df['scraping_date'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # 8. Supprimer les colonnes en double (PRÉVENTION)
        df = df.loc[:, ~df.columns.duplicated()]
        
        # 9. Réorganisation des colonnes
        column_order = [
            'clean_title', 'clean_company', 'city', 'region_admin', 'country',
            'contract_type', 'seniority', 'category', 'url',
            'scraping_date'
        ]
        
        # Garder les colonnes originales si besoin
        original_columns = [col for col in df.columns if col not in column_order]
        final_columns = column_order + original_columns
        final_columns = [col for col in final_columns if col in df.columns]
        
        df = df[final_columns]
        
        # Renommer pour plus de clarté
        rename_dict = {}
        if 'clean_title' in df.columns:
            rename_dict['clean_title'] = 'titre'
        if 'clean_company' in df.columns:
            rename_dict['clean_company'] = 'entreprise'
        
        if rename_dict:
            df = df.rename(columns=rename_dict)
        
        self.rapport['cleaned_count'] = len(df)
        
        if self.rapport['raw_count'] > 0:
            print(f"\n✅ Nettoyage terminé!")
            print(f"   Avant: {self.rapport['raw_count']} offres")
            print(f"   Après: {self.rapport['cleaned_count']} offres")
            print(f"   Taux de conservation: {self.rapport['cleaned_count']/self.rapport['raw_count']*100:.1f}%")
        
        return df
    
    def save_cleaned_data(self, df: pd.DataFrame, output_path: str, format: str = 'all'):
        """
        Sauvegarde les données nettoyées dans différents formats (VERSION CORRIGÉE)
        """
        # Enlever les colonnes en double avant sauvegarde
        df = df.loc[:, ~df.columns.duplicated()]
        
        # Enlève l'extension si elle existe
        base_name = output_path.replace('.json', '').replace('.csv', '').replace('.xlsx', '')
        
        if format in ['csv', 'all']:
            csv_file = f"{base_name}.csv"
            df.to_csv(csv_file, index=False, encoding='utf-8-sig')
            print(f"📁 CSV sauvegardé: {csv_file}")
        
        if format in ['json', 'all']:
            json_file = f"{base_name}.json"
            df.to_json(json_file, orient='records', force_ascii=False, indent=2)
            print(f"📁 JSON sauvegardé: {json_file}")
        
        if format in ['excel', 'all']:
            excel_file = f"{base_name}.xlsx"
            df.to_excel(excel_file, index=False, engine='openpyxl')
            print(f"📁 Excel sauvegardé: {excel_file}")
    
    def generate_report(self):
        """
        Génère un rapport du nettoyage
        """
        print("\n" + "="*50)
        print("📊 RAPPORT DE NETTOYAGE")
        print("="*50)
        for key, value in self.rapport.items():
            print(f"   {key}: {value}")
        
        # Sauvegarder le rapport
        with open('nettoyage_rapport.json', 'w', encoding='utf-8') as f:
            json.dump(self.rapport, f, indent=2, ensure_ascii=False)
        print("\n📄 Rapport sauvegardé: nettoyage_rapport.json")

# ============================================
# TESTS ET VALIDATION
# ============================================

def test_cleaner():
    """
    Fonction de test pour valider le nettoyage
    """
    print("🧪 DÉBUT DES TESTS")
    print("="*50)
    
    # Créer des données de test
    test_data = {
        'title': [
            "Contrôleur de Gestion (H/F) | Casablanca (Maroc)",
            "Magasiner Pièces de Rechange (H/F) | Casablanca (Maroc)",
            "  Développeur Full Stack Senior  ",
            "Commercial (H/F) | Rabat",
            None,
            "Ingénieur Data | Casablanca"
        ],
        'company': [
            "Confidentiel",
            "M-automotiv",
            "CAPGEMINI",
            None,
            "ORANGE",
            "OCP"
        ],
        'region': [
            "Casablanca (Maroc)",
            "Casablanca (Maroc)",
            "Rabat, Maroc",
            "Rabat",
            None,
            "Casablanca-Settat"
        ],
        'url': [
            "url1",
            "url2",
            "url3",
            "url4",
            "url5",
            "url6"
        ]
    }
    
    df_test = pd.DataFrame(test_data)
    
    # Initialiser cleaner
    cleaner = JobOfferCleaner()
    cleaner.rapport['raw_count'] = len(df_test)
    
    # Appliquer nettoyage
    df_cleaned = cleaner.normalize_dataframe(df_test)
    
    # Afficher résultats
    print("\n📊 RÉSULTATS DES TESTS:")
    print("\nAvant nettoyage:")
    print(df_test[['title', 'company', 'region']].to_string())
    
    print("\nAprès nettoyage:")
    display_cols = [col for col in ['titre', 'entreprise', 'city', 'contract_type', 'seniority', 'category'] if col in df_cleaned.columns]
    if display_cols:
        print(df_cleaned[display_cols].to_string())
    
    # Vérifications
    print("\n✅ VALIDATION:")
    
    if len(df_cleaned) > 0 and 'titre' in df_cleaned.columns:
        if "H/F" not in df_cleaned['titre'].iloc[0]:
            print("   ✓ Suppression (H/F) OK")
        else:
            print("   ❌ (H/F) non supprimé")
    
    if len(df_cleaned) > 0 and 'entreprise' in df_cleaned.columns:
        if df_cleaned['entreprise'].iloc[0] == "Confidentiel":
            print("   ✓ Nettoyage entreprise OK")
        else:
            print("   ❌ Entreprise mal nettoyée")
    
    if len(df_cleaned) > 0 and 'city' in df_cleaned.columns:
        if df_cleaned['city'].iloc[0] == "Casablanca":
            print("   ✓ Extraction ville OK")
        else:
            print("   ❌ Ville non extraite")
    
    print("\n🎉 TESTS TERMINÉS!")
    
    return cleaner, df_cleaned

# ============================================
# FONCTION POUR NETTOYER UN FICHIER RÉEL
# ============================================

def nettoyer_fichier_reel(input_file: str, output_file: str = None):
    """
    Nettoie un fichier JSON réel et sauvegarde le résultat
    """
    print("="*60)
    print("🚀 NETTOYAGE DE FICHIER RÉEL")
    print("="*60)
    
    if not os.path.exists(input_file):
        print(f"❌ Fichier {input_file} non trouvé")
        return None
    
    cleaner = JobOfferCleaner()
    df = cleaner.load_json_data(input_file)
    
    if df.empty:
        print("❌ Aucune donnée chargée")
        return None
    
    df_cleaned = cleaner.normalize_dataframe(df)
    
    # Déterminer le nom de sortie
    if output_file is None:
        base_name = os.path.splitext(input_file)[0]
        output_file = f"{base_name}_nettoye"
    
    cleaner.save_cleaned_data(df_cleaned, output_file, format='all')
    cleaner.generate_report()
    
    print(f"\n✅ Nettoyage terminé! {len(df_cleaned)} offres sauvegardées")
    return df_cleaned

# ============================================
# FONCTION PRINCIPALE
# ============================================

def main():
    """
    Fonction principale - Interface utilisateur
    """
    print("="*60)
    print("🧹 CLEANER D'OFFRES D'EMPLOI")
    print("="*60)
    print("\nCe programme nettoie les données d'offres d'emploi")
    print("(supprime (H/F), nettoie les titres, extrait les villes, etc.)\n")
    
    while True:
        print("\n" + "-"*40)
        print("OPTIONS:")
        print("1. Tester avec données exemple")
        print("2. Nettoyer mon fichier JSON")
        print("3. Quitter")
        
        choix = input("\nVotre choix (1/2/3): ")
        
        if choix == '1':
            print("\n" + "="*40)
            cleaner, df_test = test_cleaner()
            # Sauvegarder les résultats du test
            try:
                df_test.to_csv('test_resultat.csv', index=False, encoding='utf-8-sig')
                print("💾 test_resultat.csv sauvegardé")
            except Exception as e:
                print(f"⚠️ Erreur CSV: {e}")
            
            try:
                df_test.to_json('test_resultat.json', orient='records', force_ascii=False, indent=2)
                print("💾 test_resultat.json sauvegardé")
            except Exception as e:
                print(f"⚠️ Erreur JSON: {e}")
            
            try:
                df_test.to_excel('test_resultat.xlsx', index=False, engine='openpyxl')
                print("💾 test_resultat.xlsx sauvegardé")
            except Exception as e:
                print(f"⚠️ Erreur Excel: {e}")
            
            print("\n✅ Fichiers de test sauvegardés!")
            
        elif choix == '2':
            print("\n" + "="*40)
            input_file = input("Chemin du fichier JSON à nettoyer: ")
            input_file = input_file.strip('"').strip("'")
            
            output_file = input("Nom du fichier de sortie (sans extension, appuyez Entrée pour auto): ")
            if not output_file:
                output_file = None
            
            nettoyer_fichier_reel(input_file, output_file)
            
        elif choix == '3':
            print("\n👋 Au revoir!")
            break
        else:
            print("❌ Choix invalide")

# ============================================
# EXÉCUTION PRINCIPALE
# ============================================

if __name__ == "__main__":
    main()