#!/usr/bin/env python3
"""
PM Office Intelligence Dashboard - Article Processing Pipeline
Processes newspaper articles from CSV files and generates structured JSON data
with AI-powered insights using transformers.
"""

import os
import json
import glob
from datetime import datetime
from typing import List, Dict, Any
import pandas as pd
import numpy as np
from transformers import pipeline
from sentence_transformers import SentenceTransformer
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity

# KPI Definitions
POWER_KPIS = {
    "td-losses": {
        "name": "T&D Losses",
        "keywords": ["T&D loss", "transmission loss", "distribution loss", "line loss"],
        "category": "Energy",
        "description": "Transmission and distribution losses in the power sector"
    },
    "circular-debt": {
        "name": "Circular Debt",
        "keywords": ["circular debt", "power sector debt"],
        "category": "Energy",
        "description": "Circular debt crisis in the power sector"
    },
    "electricity-recovery": {
        "name": "Electricity Recovery",
        "keywords": ["electricity recovery", "bill recovery", "power recovery"],
        "category": "Energy",
        "description": "Electricity bill recovery and collection rates"
    },
    "imported-electricity": {
        "name": "Imported Electricity",
        "keywords": ["imported electricity", "power import", "energy import"],
        "category": "Energy",
        "description": "Electricity imported from neighboring countries"
    },
    "power-sector": {
        "name": "Power Sector",
        "keywords": ["power sector", "electricity sector", "energy sector", "Nepra", "Disco", "IPP"],
        "category": "Energy",
        "description": "Overall power sector performance and stability"
    }
}

TAX_KPIS = {
    "fbr-tax": {
        "name": "FBR Tax Collection",
        "keywords": ["FBR", "Federal Board of Revenue", "tax revenue"],
        "category": "Taxation",
        "description": "Federal Board of Revenue tax collection"
    },
    "tax-to-gdp": {
        "name": "Tax-to-GDP Ratio",
        "keywords": ["tax-to-GDP", "tax to GDP", "tax GDP ratio"],
        "category": "Taxation",
        "description": "Tax collection as percentage of GDP"
    },
    "tax-collection": {
        "name": "Tax Collection",
        "keywords": ["tax collection", "revenue collection", "tax receipts"],
        "category": "Taxation",
        "description": "Overall tax collection performance"
    },
    "tax-expenditure": {
        "name": "Tax Expenditure",
        "keywords": ["tax expenditure", "tax exemption", "tax concession"],
        "category": "Taxation",
        "description": "Tax expenditures and exemptions"
    },
    "direct-taxes": {
        "name": "Direct Taxes",
        "keywords": ["direct tax", "income tax", "corporate tax"],
        "category": "Taxation",
        "description": "Direct taxation revenue"
    },
    "withholding-taxes": {
        "name": "Withholding Taxes",
        "keywords": ["withholding tax", "WHT", "advance tax"],
        "category": "Taxation",
        "description": "Withholding tax collection"
    }
}

ALL_KPIS = {**POWER_KPIS, **TAX_KPIS}

# Source credibility scores
SOURCE_CREDIBILITY = {
    "Dawn": 95,
    "Business Recorder": 90,
    "The News": 88,
    "Express Tribune": 92,
    "Geo News": 85
}


class ArticleProcessor:
    """Main processor for article data pipeline"""

    def __init__(self):
        print("🚀 Initializing Article Processor...")

        # Load transformer models
        print("📥 Loading sentiment analysis model...")
        self.sentiment_analyzer = pipeline(
            "sentiment-analysis",
            model="distilbert-base-uncased-finetuned-sst-2-english"
        )

        print("📥 Loading sentence transformer for KPI mapping...")
        self.semantic_model = SentenceTransformer('all-MiniLM-L6-v2')

        # Pre-compute KPI embeddings
        self.kpi_embeddings = {}
        for kpi_id, kpi_data in ALL_KPIS.items():
            kpi_text = f"{kpi_data['name']} {kpi_data['description']} {' '.join(kpi_data['keywords'])}"
            self.kpi_embeddings[kpi_id] = self.semantic_model.encode(kpi_text)

        print("✅ Models loaded successfully!\n")

    def safe_mean(self, values):
        """Calculate mean while filtering out NaN and None values"""
        filtered = [v for v in values if v is not None and not (isinstance(v, float) and np.isnan(v))]
        if not filtered:
            return 0.0
        return np.mean(filtered)

    def load_csv_files(self, data_dir: str) -> pd.DataFrame:
        """Load all CSV files from data directory"""
        print("📂 Loading CSV files...")

        csv_files = glob.glob(f"{data_dir}/**/**.csv", recursive=True)
        print(f"Found {len(csv_files)} CSV files")

        all_data = []
        for csv_file in csv_files:
            try:
                # Extract metadata from file path
                # e.g., data/postprocessed/dawn/2026-01-21/power_2026-01-21_processed_summarized.csv
                parts = csv_file.split(os.sep)
                source = parts[-3]  # dawn or brecorder
                date = parts[-2]    # 2026-01-21
                filename = parts[-1]
                category = "power" if filename.startswith("power") else "tax"

                df = pd.read_csv(csv_file)
                df['source'] = source
                df['date'] = date
                df['category'] = category

                all_data.append(df)
                print(f"  ✓ Loaded {len(df)} articles from {source}/{date}/{category}")

            except Exception as e:
                print(f"  ✗ Error loading {csv_file}: {e}")

        combined_df = pd.concat(all_data, ignore_index=True)
        print(f"\n📊 Total articles loaded: {len(combined_df)}\n")

        return combined_df

    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of text using transformers"""
        try:
            # Truncate to 512 tokens for BERT
            truncated_text = text[:512]
            result = self.sentiment_analyzer(truncated_text)[0]

            # Convert to our sentiment scale
            label = result['label'].lower()
            score = result['score']

            if label == 'positive':
                sentiment_score = score
                sentiment = 'positive'
            else:  # negative
                sentiment_score = -score
                sentiment = 'negative'

            # Neutral threshold
            if abs(sentiment_score) < 0.3:
                sentiment = 'neutral'

            return {
                'sentiment': sentiment,
                'sentimentScore': sentiment_score
            }
        except Exception as e:
            print(f"  ⚠️  Sentiment analysis error: {e}")
            return {'sentiment': 'neutral', 'sentimentScore': 0.0}

    def extract_kpi_relevance(self, text: str, category: str) -> Dict[str, float]:
        """Extract KPI relevance scores using keyword + semantic matching"""
        relevance_scores = {}
        text_lower = text.lower()

        # Get article embedding
        article_embedding = self.semantic_model.encode(text)

        # Filter KPIs by category
        relevant_kpis = {k: v for k, v in ALL_KPIS.items()
                        if (category == 'power' and k in POWER_KPIS) or
                           (category == 'tax' and k in TAX_KPIS)}

        for kpi_id, kpi_data in relevant_kpis.items():
            # Keyword matching score
            keyword_matches = sum(1 for keyword in kpi_data['keywords']
                                if keyword.lower() in text_lower)
            keyword_score = min(keyword_matches / len(kpi_data['keywords']), 1.0) * 100

            # Semantic similarity score
            kpi_embedding = self.kpi_embeddings[kpi_id]
            semantic_sim = cosine_similarity(
                article_embedding.reshape(1, -1),
                kpi_embedding.reshape(1, -1)
            )[0][0]
            semantic_score = max(0, semantic_sim) * 100

            # Combined score (60% semantic, 40% keyword)
            combined_score = (semantic_score * 0.6 + keyword_score * 0.4)
            relevance_scores[kpi_id] = round(combined_score, 2)

        return relevance_scores

    def extract_terms(self, text: str) -> List[str]:
        """Extract key terms from text (simplified)"""
        # Simple extraction - in production, use NER
        terms = []
        keywords = ['Nepra', 'FBR', 'IMF', 'GDP', 'IPP', 'Disco', 'CPEC', 'circular debt']
        text_lower = text.lower()

        for keyword in keywords:
            if keyword.lower() in text_lower:
                terms.append(keyword)

        return terms

    def process_articles(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Process all articles with AI features"""
        print("🤖 Processing articles with AI models...\n")

        articles = []
        for idx, row in df.iterrows():
            if idx % 50 == 0:
                print(f"  Processed {idx}/{len(df)} articles...")

            # Get source name (capitalize)
            source = row['source'].title()
            if source == 'Brecorder':
                source = 'Business Recorder'

            # Sentiment analysis
            sentiment_data = self.analyze_sentiment(row['summary'])

            # KPI relevance
            kpi_relevance = self.extract_kpi_relevance(
                row['summary'],
                row['category']
            )

            # Extract terms
            extracted_terms = self.extract_terms(row['summary'])

            # Get KPI IDs (relevance > 30)
            kpi_ids = [kpi_id for kpi_id, score in kpi_relevance.items() if score > 30]

            article = {
                'id': f"{row['source']}-{row['date']}-{row['category']}-{idx}",
                'title': row['article headline'],
                'source': source,
                'category': row['category'],
                'publishedAt': f"{row['date']}T00:00:00Z",
                'summary': row['summary'],
                'fullText': row['article text'],
                'url': row['article link'],
                'author': row.get('author', ''),
                'sentiment': sentiment_data['sentiment'],
                'sentimentScore': sentiment_data['sentimentScore'],
                'kpiRelevance': kpi_relevance,
                'kpiIds': kpi_ids,
                'extractedTerms': extracted_terms,
                'credibilityScore': SOURCE_CREDIBILITY.get(source, 85)
            }

            articles.append(article)

        print(f"\n✅ Processed {len(articles)} articles\n")
        return articles

    def perform_topic_clustering(self, articles: List[Dict]) -> List[Dict]:
        """Perform topic clustering on articles"""
        print("🎯 Performing topic clustering...")

        # Get article summaries
        summaries = [a['summary'] for a in articles]

        # Generate embeddings
        print("  Encoding article summaries...")
        embeddings = self.semantic_model.encode(summaries, show_progress_bar=True)

        # K-means clustering
        n_clusters = min(10, len(articles) // 50)  # At least 50 articles per cluster
        if n_clusters < 2:
            n_clusters = 2

        print(f"  Clustering into {n_clusters} topics...")
        kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        cluster_labels = kmeans.fit_predict(embeddings)

        # Add cluster labels to articles
        for i, article in enumerate(articles):
            article['topicCluster'] = int(cluster_labels[i])

        print(f"✅ Clustered articles into {n_clusters} topics\n")
        return articles

    def generate_kpis(self, articles: List[Dict]) -> List[Dict]:
        """Generate KPI metadata with scores"""
        print("📈 Generating KPI metadata...")

        kpis = []

        for kpi_id, kpi_data in ALL_KPIS.items():
            # Filter relevant articles (relevance > 30)
            relevant_articles = [
                a for a in articles
                if kpi_id in a['kpiRelevance'] and a['kpiRelevance'][kpi_id] > 30
            ]

            if not relevant_articles:
                continue

            # Calculate current score (avg sentiment * relevance)
            scores = []
            for article in relevant_articles:
                sentiment_score = article['sentimentScore']
                relevance = article['kpiRelevance'][kpi_id] / 100
                weighted_score = ((sentiment_score + 1) / 2) * relevance * 100  # 0-100 scale
                scores.append(weighted_score)

            current_score = self.safe_mean(scores) if scores else 50

            # Calculate trend (compare recent vs older articles)
            sorted_articles = sorted(relevant_articles, key=lambda x: x['publishedAt'])
            mid_point = len(sorted_articles) // 2

            if len(sorted_articles) > 5:
                older_scores = [
                    ((a['sentimentScore'] + 1) / 2) * (a['kpiRelevance'][kpi_id] / 100) * 100
                    for a in sorted_articles[:mid_point]
                ]
                recent_scores = [
                    ((a['sentimentScore'] + 1) / 2) * (a['kpiRelevance'][kpi_id] / 100) * 100
                    for a in sorted_articles[mid_point:]
                ]
                previous_score = self.safe_mean(older_scores)

                if current_score > previous_score + 5:
                    trend = "up"
                elif current_score < previous_score - 5:
                    trend = "down"
                else:
                    trend = "stable"
            else:
                previous_score = current_score
                trend = "stable"

            # Historical data by date
            historical_data = {}
            for article in relevant_articles:
                date = article['publishedAt'][:10]
                if date not in historical_data:
                    historical_data[date] = []

                score = ((article['sentimentScore'] + 1) / 2) * (article['kpiRelevance'][kpi_id] / 100) * 100
                historical_data[date].append(score)

            historical = [
                {
                    'date': date,
                    'score': round(self.safe_mean(scores), 2),
                    'articleCount': len(scores)
                }
                for date, scores in sorted(historical_data.items())
            ]

            kpi = {
                'id': kpi_id,
                'name': kpi_data['name'],
                'description': kpi_data['description'],
                'category': kpi_data['category'],
                'keywords': kpi_data['keywords'],
                'currentScore': round(current_score, 2),
                'previousScore': round(previous_score, 2),
                'trend': trend,
                'articleCount': len(relevant_articles),
                'lastUpdated': max(a['publishedAt'] for a in relevant_articles),
                'historicalData': historical
            }

            kpis.append(kpi)

        print(f"✅ Generated {len(kpis)} KPIs\n")
        return kpis

    def generate_trends(self, articles: List[Dict]) -> Dict[str, Any]:
        """Generate trend data for charts"""
        print("📊 Generating trend data...")

        # Group by date
        by_date = {}
        for article in articles:
            date = article['publishedAt'][:10]
            if date not in by_date:
                by_date[date] = {'positive': 0, 'negative': 0, 'neutral': 0}

            by_date[date][article['sentiment']] += 1

        sentiment_trends = [
            {
                'date': date,
                'positive': counts['positive'],
                'negative': counts['negative'],
                'neutral': counts['neutral']
            }
            for date, counts in sorted(by_date.items())
        ]

        print(f"✅ Generated trends for {len(sentiment_trends)} dates\n")

        return {
            'sentimentTrends': sentiment_trends
        }

    def detect_anomalies(self, articles: List[Dict], kpis: List[Dict]) -> List[Dict]:
        """Detect anomalies and generate alerts"""
        print("🚨 Detecting anomalies and generating alerts...")

        alerts = []

        # Group articles by date
        by_date = {}
        for article in articles:
            date = article['publishedAt'][:10]
            if date not in by_date:
                by_date[date] = []
            by_date[date].append(article)

        dates = sorted(by_date.keys())

        # Article volume spike detection
        daily_counts = [len(by_date[date]) for date in dates]
        if len(daily_counts) > 3:
            mean_count = self.safe_mean(daily_counts)
            std_count = np.std(daily_counts)

            for date in dates[-3:]:  # Check last 3 days
                count = len(by_date[date])
                if count > mean_count + 2 * std_count:
                    alerts.append({
                        'id': f'alert-spike-{date}',
                        'title': 'Unusual Article Volume Spike',
                        'description': f'{count} articles published on {date} ({count - mean_count:.0f} above average)',
                        'severity': 'warning',
                        'status': 'new',
                        'createdAt': f'{date}T00:00:00Z',
                        'source': 'Anomaly Detection'
                    })

        # KPI-specific alerts
        for kpi in kpis:
            # Declining score alert
            if kpi['trend'] == 'down' and kpi['currentScore'] < 40:
                alerts.append({
                    'id': f'alert-decline-{kpi["id"]}',
                    'title': f'{kpi["name"]} Score Declining',
                    'description': f'{kpi["name"]} score dropped to {kpi["currentScore"]:.1f} (from {kpi["previousScore"]:.1f})',
                    'severity': 'critical' if kpi['currentScore'] < 30 else 'warning',
                    'status': 'new',
                    'kpiId': kpi['id'],
                    'createdAt': kpi['lastUpdated'],
                    'source': 'KPI Monitoring'
                })

            # Negative sentiment surge
            kpi_articles = [a for a in articles if kpi['id'] in a['kpiIds']]
            if len(kpi_articles) > 10:
                recent_kpi_articles = sorted(kpi_articles, key=lambda x: x['publishedAt'])[-7:]
                negative_pct = sum(1 for a in recent_kpi_articles if a['sentiment'] == 'negative') / len(recent_kpi_articles)

                if negative_pct > 0.7:
                    alerts.append({
                        'id': f'alert-negative-{kpi["id"]}',
                        'title': f'High Negative Coverage for {kpi["name"]}',
                        'description': f'{negative_pct*100:.0f}% of recent articles about {kpi["name"]} are negative',
                        'severity': 'warning',
                        'status': 'new',
                        'kpiId': kpi['id'],
                        'createdAt': recent_kpi_articles[-1]['publishedAt'],
                        'source': 'Sentiment Analysis'
                    })

        print(f"✅ Generated {len(alerts)} alerts\n")
        return alerts

    def generate_insights(self, articles: List[Dict], kpis: List[Dict], alerts: List[Dict]) -> List[Dict]:
        """Generate AI insights"""
        print("💡 Generating AI insights...")

        insights = []

        # Sentiment trend insights
        for kpi in kpis:
            kpi_articles = [a for a in articles if kpi['id'] in a['kpiIds']]
            if len(kpi_articles) > 10:
                avg_sentiment = self.safe_mean([a['sentimentScore'] for a in kpi_articles])

                if kpi['trend'] == 'up' and avg_sentiment > 0.3:
                    insights.append({
                        'id': f'insight-positive-{kpi["id"]}',
                        'title': f'{kpi["name"]} Showing Positive Momentum',
                        'summary': f'Analysis indicates {kpi["name"]} coverage is {kpi["currentScore"]-kpi["previousScore"]:.1f} points higher than previous period, with {len([a for a in kpi_articles if a["sentiment"] == "positive"])} positive articles.',
                        'type': 'trend',
                        'confidence': round(min(95, 70 + abs(kpi["currentScore"] - kpi["previousScore"])), 2),
                        'relatedKpiIds': [kpi['id']],
                        'createdAt': kpi['lastUpdated']
                    })

                elif kpi['trend'] == 'down' and avg_sentiment < -0.2:
                    insights.append({
                        'id': f'insight-negative-{kpi["id"]}',
                        'title': f'{kpi["name"]} Facing Negative Coverage',
                        'summary': f'{kpi["name"]} coverage is trending negative with {len([a for a in kpi_articles if a["sentiment"] == "negative"])} negative articles. Score dropped {kpi["previousScore"]-kpi["currentScore"]:.1f} points.',
                        'type': 'risk',
                        'confidence': round(min(95, 70 + abs(kpi["currentScore"] - kpi["previousScore"])), 2),
                        'relatedKpiIds': [kpi['id']],
                        'createdAt': kpi['lastUpdated']
                    })

        # Topic cluster insights
        cluster_counts = {}
        for article in articles:
            cluster = article.get('topicCluster', 0)
            if cluster not in cluster_counts:
                cluster_counts[cluster] = []
            cluster_counts[cluster].append(article)

        # Find emerging topics (clusters with high recent activity)
        for cluster_id, cluster_articles in cluster_counts.items():
            if len(cluster_articles) > 15:
                # Extract common terms
                all_terms = []
                for a in cluster_articles:
                    all_terms.extend(a.get('extractedTerms', []))

                from collections import Counter
                common_terms = Counter(all_terms).most_common(3)
                term_str = ', '.join([t[0] for t in common_terms]) if common_terms else 'various topics'

                cluster_avg_sentiment = self.safe_mean([a["sentimentScore"] for a in cluster_articles])
                insights.append({
                    'id': f'insight-cluster-{cluster_id}',
                    'title': f'Emerging Theme Detected: {term_str}',
                    'summary': f'Topic cluster with {len(cluster_articles)} articles identified. Common themes: {term_str}. Avg sentiment: {cluster_avg_sentiment:.2f}',
                    'type': 'recommendation',
                    'confidence': round(min(90, 60 + len(cluster_articles)), 2),
                    'relatedKpiIds': list(set([kpi_id for a in cluster_articles for kpi_id in a['kpiIds']])),
                    'createdAt': max(a['publishedAt'] for a in cluster_articles)
                })

        # Predictive alerts based on trends
        for kpi in kpis:
            if len(kpi['historicalData']) >= 3:
                recent_scores = [h['score'] for h in kpi['historicalData'][-3:]]
                if all(recent_scores[i] < recent_scores[i-1] for i in range(1, len(recent_scores))):
                    insights.append({
                        'id': f'insight-predict-{kpi["id"]}',
                        'title': f'Predictive Alert: {kpi["name"]} Declining',
                        'summary': f'{kpi["name"]} has shown consistent decline over 3 consecutive periods. Immediate attention may be required to reverse the trend.',
                        'type': 'risk',
                        'confidence': 88,
                        'relatedKpiIds': [kpi['id']],
                        'createdAt': kpi['lastUpdated']
                    })

        print(f"✅ Generated {len(insights)} insights\n")
        return insights

    def convert_to_native_types(self, obj):
        """Convert numpy types to Python native types for JSON serialization"""
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            # Convert NaN and Inf to None (null in JSON)
            val = float(obj)
            if np.isnan(val) or np.isinf(val):
                return None
            return val
        elif isinstance(obj, float):
            # Handle regular Python floats that might be NaN or Inf
            if np.isnan(obj) or np.isinf(obj):
                return None
            return obj
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, dict):
            return {key: self.convert_to_native_types(value) for key, value in obj.items()}
        elif isinstance(obj, list):
            return [self.convert_to_native_types(item) for item in obj]
        else:
            return obj

    def save_outputs(self, output_dir: str, articles: List, kpis: List, trends: Dict, insights: List, alerts: List):
        """Save all processed data to JSON files"""
        print("💾 Saving processed data...")

        os.makedirs(output_dir, exist_ok=True)

        # Convert all data to native types
        articles = self.convert_to_native_types(articles)
        kpis = self.convert_to_native_types(kpis)
        trends = self.convert_to_native_types(trends)
        insights = self.convert_to_native_types(insights)
        alerts = self.convert_to_native_types(alerts)

        # Save articles
        with open(f"{output_dir}/articles.json", 'w') as f:
            json.dump({'articles': articles}, f, indent=2)
        print(f"  ✓ Saved {len(articles)} articles")

        # Save KPIs
        with open(f"{output_dir}/kpis.json", 'w') as f:
            json.dump({'kpis': kpis}, f, indent=2)
        print(f"  ✓ Saved {len(kpis)} KPIs")

        # Save trends
        with open(f"{output_dir}/trends.json", 'w') as f:
            json.dump(trends, f, indent=2)
        print(f"  ✓ Saved trend data")

        # Save insights and alerts
        with open(f"{output_dir}/insights.json", 'w') as f:
            json.dump({'insights': insights, 'alerts': alerts}, f, indent=2)
        print(f"  ✓ Saved {len(insights)} insights and {len(alerts)} alerts")

        print("\n✅ All data saved successfully!\n")


def main():
    """Main execution pipeline"""
    print("\n" + "="*60)
    print("PM OFFICE INTELLIGENCE DASHBOARD - ARTICLE PROCESSOR")
    print("="*60 + "\n")

    # Initialize processor
    processor = ArticleProcessor()

    # Load CSV files
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'data', 'postprocessed')
    df = processor.load_csv_files(data_dir)

    # Process articles
    articles = processor.process_articles(df)

    # Topic clustering
    articles = processor.perform_topic_clustering(articles)

    # Generate KPIs
    kpis = processor.generate_kpis(articles)

    # Generate trends
    trends = processor.generate_trends(articles)

    # Detect anomalies
    alerts = processor.detect_anomalies(articles, kpis)

    # Generate insights
    insights = processor.generate_insights(articles, kpis, alerts)

    # Save outputs
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'insight-hub', 'public', 'data')
    processor.save_outputs(output_dir, articles, kpis, trends, insights, alerts)

    print("="*60)
    print("🎉 PROCESSING COMPLETE!")
    print("="*60)
    print(f"\n📊 Summary:")
    print(f"  • {len(articles)} articles processed")
    print(f"  • {len(kpis)} KPIs tracked")
    print(f"  • {len(insights)} insights generated")
    print(f"  • {len(alerts)} alerts created")
    print(f"\n📁 Output location: {output_dir}\n")


if __name__ == "__main__":
    main()
