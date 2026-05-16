import { NextResponse } from 'next/server';
import RSS from 'rss';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const feed = new RSS({
      title: 'Systems Check',
      description: 'The definitive podcast on medical infrastructure, systems engineering, and the future of clinical practice. Hosted by Sonny Saggar MD.',
      feed_url: 'https://newphysician.org/api/feed',
      site_url: 'https://newphysician.org',
      image_url: 'https://newphysician.org/podcast-cover.jpg',
      managingEditor: 'Sonny Saggar MD',
      webMaster: 'The Hive Ecosystem',
      copyright: `${new Date().getFullYear()} Sonny Saggar MD`,
      language: 'en',
      pubDate: new Date().toUTCString(),
      ttl: 60,
      custom_namespaces: {
        itunes: 'http://www.itunes.com/dtds/podcast-1.0.dtd'
      },
      custom_elements: [
        {'itunes:author': 'Sonny Saggar MD'},
        {'itunes:subtitle': 'Systems Engineering in Medicine'},
        {'itunes:summary': 'The definitive podcast on medical infrastructure and the future of clinical practice.'},
        {'itunes:owner': [
          {'itunes:name': 'Sonny Saggar MD'},
          {'itunes:email': 'saggarsonny@gmail.com'}
        ]},
        {'itunes:image': {
          _attr: {
            href: 'https://newphysician.org/podcast-cover.jpg'
          }
        }},
        {'itunes:category': [
          {_attr: {
            text: 'Health & Fitness'
          }},
          {_attr: {
            text: 'Medicine'
          }}
        ]}
      ]
    });

    const episodes = await prisma.podcastEpisode.findMany({
      orderBy: { publishedAt: 'desc' }
    });

    episodes.forEach((episode: any) => {
      feed.item({
        title: episode.title,
        description: episode.description,
        url: `https://newphysician.org/podcast/${episode.id}`,
        guid: episode.id,
        date: episode.publishedAt,
        enclosure: {
          url: episode.audioUrl,
          type: 'audio/mpeg'
        },
        custom_elements: [
          {'itunes:author': 'Sonny Saggar MD'},
          {'itunes:duration': episode.duration.toString()},
          {'itunes:episodeType': 'full'}
        ]
      });
    });

    const xml = feed.xml({ indent: true });

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate'
      }
    });

  } catch (error) {
    console.error('Failed to generate RSS feed:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
