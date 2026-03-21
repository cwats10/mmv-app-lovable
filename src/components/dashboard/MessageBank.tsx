import { useState } from 'react';
import { Copy, Check, MessageSquare, ChevronDown, Sparkles } from 'lucide-react';
import { PageTag } from '@/components/common/PageTag';
import { generateShareUrl, generateManagerUrl } from '@/lib/utils';
import type { Vault, Profile } from '@/types';

interface Props {
  vaults: Vault[];
  profile: Profile | null;
}

type Tab = 'contributors' | 'managers' | 'referrals' | 'reveal';
type Platform = 'text' | 'email' | 'facebook' | 'instagram' | 'ward';

interface Message {
  label: string;
  body: string;
}

interface RevealIdea {
  title: string;
  body: string;
}

function useClipboard() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  async function copy(key: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  }
  return { copiedKey, copy };
}

function MessageCard({ msgKey, text, label, copiedKey, onCopy }: {
  msgKey: string;
  text: string;
  label: string;
  copiedKey: string | null;
  onCopy: (key: string, text: string) => void;
}) {
  const isCopied = copiedKey === msgKey;
  return (
    <div style={{ border: '1px solid #e0deda', backgroundColor: '#ffffff' }}>
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: '1px solid #e0deda', backgroundColor: '#f4f2ef' }}
      >
        <span className="font-space-mono text-xs text-[#555555] uppercase tracking-widest">{label}</span>
        <button
          onClick={() => onCopy(msgKey, text)}
          className="flex items-center gap-1.5 font-space-mono text-xs uppercase tracking-widest transition-colors"
          style={{ color: isCopied ? '#222222' : '#555555' }}
        >
          {isCopied ? <Check size={12} /> : <Copy size={12} />}
          {isCopied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p className="px-4 py-4 text-sm text-[#555555] font-inter whitespace-pre-wrap" style={{ lineHeight: 1.75 }}>
        {text}
      </p>
    </div>
  );
}

function RevealCard({ title, body }: RevealIdea) {
  return (
    <div style={{ border: '1px solid #e0deda', backgroundColor: '#ffffff' }}>
      <div
        className="px-4 py-2.5 flex items-center gap-2"
        style={{ borderBottom: '1px solid #e0deda', backgroundColor: '#f4f2ef' }}
      >
        <Sparkles size={11} className="text-[#555555]" />
        <span className="font-space-mono text-xs text-[#222222] uppercase tracking-widest">{title}</span>
      </div>
      <p className="px-4 py-4 text-sm text-[#555555] font-inter" style={{ lineHeight: 1.8 }}>
        {body}
      </p>
    </div>
  );
}

const PLATFORM_TABS: { id: Platform; label: string }[] = [
  { id: 'text', label: 'Text' },
  { id: 'email', label: 'Email' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'ward', label: 'Ward / Stake' },
];

export function MessageBank({ vaults, profile }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('contributors');
  const [platform, setPlatform] = useState<Platform>('text');
  const selectedVault = vaults[0] ?? null;
  const { copiedKey, copy } = useClipboard();

  
  const contributeUrl = selectedVault ? generateShareUrl(selectedVault.submission_token) : '[vault link]';
  const managerUrl = selectedVault ? generateManagerUrl((selectedVault as any).manager_token ?? selectedVault.submission_token) : '[manager link]';
  const missionaryName = selectedVault?.missionary_name ?? '[missionary name]';
  const referralUrl = profile?.referral_code
    ? `${window.location.origin}/auth?tab=signup&ref=${profile.referral_code}`
    : '[your referral link]';
  const senderName = profile?.name?.split(' ')[0] ?? 'A friend';

  const contributorMessages: Record<Platform, Message[]> = {
    text: [
      {
        label: 'Personal text',
        body: `Hey! I'm making a Memory Book for ${missionaryName} and I'd love a note from you. It only takes a few minutes — you can write a message and even add a photo. No account needed!\n\n${contributeUrl}`,
      },
      {
        label: 'Group family text',
        body: `Hey everyone! We're creating a special Memory Book for ${missionaryName} and want a note from each of you. Click the link, write your memory, add a photo if you'd like — takes 5 minutes!\n\n👉 ${contributeUrl}\n\nThank you!`,
      },
      {
        label: 'Reminder follow-up',
        body: `Quick reminder — we're still collecting memories for ${missionaryName}'s book! Still time to add yours:\n\n${contributeUrl} 🙏`,
      },
    ],
    email: [
      {
        label: 'Formal invite',
        body: `Subject: A keepsake for ${missionaryName} — would you contribute a memory?\n\nDear [Name],\n\nI'm putting together a Memory Book for ${missionaryName} as a permanent keepsake of their mission. I would be so honored to include a note from you.\n\nThe process is simple: click the link below, write your memory, and upload a photo if you'd like. You can even choose exactly where the photo appears on the page. No account is required.\n\n${contributeUrl}\n\nThank you so much — your words will be treasured for generations.\n\nWith gratitude,\n${senderName}`,
      },
      {
        label: 'Short email invite',
        body: `Subject: Memory Book for ${missionaryName}\n\nHi!\n\nWe're collecting memories and photos for ${missionaryName}'s heirloom Memory Book. Would you add yours?\n\n${contributeUrl}\n\nNo account needed. Thank you!`,
      },
      {
        label: 'Reminder email',
        body: `Subject: Still time to contribute — ${missionaryName}'s Memory Book\n\nHi,\n\nJust a friendly reminder that we're still collecting memories for ${missionaryName}'s book. We'd love to have yours included before we send it to print.\n\n${contributeUrl}\n\nThank you!`,
      },
    ],
    facebook: [
      {
        label: 'Facebook post',
        body: `Friends — I am making something very special for ${missionaryName} and I need your help. 💛\n\nI'm putting together a printed Memory Book of stories and photos from the people who love them most. Anyone can contribute — it takes about 5 minutes and no account is needed.\n\nIf ${missionaryName} has touched your life in any way, please click the link and share a memory. It will be read and treasured for a very long time.\n\n👉 ${contributeUrl}\n\nPlease share — the more voices, the more beautiful this will be. Thank you!`,
      },
      {
        label: 'Facebook group post',
        body: `Hi everyone! 👋 Posting here because many of you know and love ${missionaryName}.\n\nWe're creating a printed Memory Book as a homecoming keepsake and would love contributions from this group! You can write a note, upload a photo, and choose how it appears on the page.\n\n🔗 ${contributeUrl}\n\nNo account needed — just click and write. Deadline is coming up so please share soon. Thank you! 🙏`,
      },
    ],
    instagram: [
      {
        label: 'Instagram caption',
        body: `Something very special is in the works for ${missionaryName}. 📖✨\n\nWe're creating a printed Memory Book filled with notes, photos, and stories from the people whose lives they touched.\n\nWant to be part of it? The link is in my bio — no account needed, just a few minutes and a memory to share.\n\nPlease share this and help us make it complete. 💛 #MissionaryMemories #HeirloomBook`,
      },
      {
        label: 'Instagram story CTA',
        body: `👆 Swipe up (or tap the link in bio) to add your memory to ${missionaryName}'s book!\n\nNo account. No sign-up. Just write your note and we handle the rest. 💛`,
      },
    ],
    ward: [
      {
        label: 'Ward newsletter / email',
        body: `Dear Ward Family,\n\nWe are creating a printed Memory Book for ${missionaryName} as they return from their mission, and we would be so grateful for contributions from members of this ward who have watched them grow.\n\nPlease take a few minutes to share a memory, a testimony, or a word of encouragement. No account is needed — simply click the link below.\n\n${contributeUrl}\n\nThank you for loving and supporting our missionary. This book will be a treasure they keep for the rest of their lives.\n\n— ${senderName}`,
      },
      {
        label: 'Sacrament meeting announcement',
        body: `We have an exciting announcement for our ward family! We are putting together a beautiful Memory Book for ${missionaryName} as a homecoming gift, and we'd love contributions from as many of you as possible. There's a link in the program — no account needed, just a few minutes to share a memory or a photo. Thank you so much!`,
      },
      {
        label: 'Stake group text',
        body: `Hi stake family! We're making a Memory Book for ${missionaryName} and would love your memories and photos. No account needed — click the link and add your note:\n\n${contributeUrl}\n\nThank you! Please share with anyone who knows them. 🙏`,
      },
    ],
  };

  const managerMessages: Message[] = [
    {
      label: 'Invite a manager',
      body: `Hi! I'm putting together a Memory Book for ${missionaryName} and could use some help reviewing contributions.\n\nThis link lets you approve or reject submissions on my behalf — you won't be able to purchase or finalize the book, just help curate the memories. I really appreciate the help!\n\nYour manager link:\n${managerUrl}`,
    },
    {
      label: 'Manager invite — short',
      body: `Hey! Could you help me review submissions for ${missionaryName}'s Memory Book? Use this link:\n\n${managerUrl}\n\nYou can approve or reject memories. Thank you!`,
    },
    {
      label: 'Email to manager',
      body: `Subject: Help reviewing memories for ${missionaryName}'s book\n\nHi,\n\nI'm creating a Memory Book for ${missionaryName} and would love your help reviewing the submissions that come in. You'll be able to approve or reject entries — but don't worry, you won't have any ability to purchase or finalize the book.\n\nHere is your manager link:\n${managerUrl}\n\nThank you so much for helping make this special.\n\n— ${senderName}`,
    },
  ];

  const referralMessages: Record<Platform, Message[]> = {
    text: [
      {
        label: 'Friend text',
        body: `Have you heard of Memory Vault? It's the most beautiful way to collect memories for your missionary and turn them into a printed heirloom book. I just started one — it's incredible.\n\nSign up with my link and we both get $20 toward a book:\n${referralUrl}`,
      },
      {
        label: 'Quick referral text',
        body: `Hey! If you have a missionary, you need Memory Vault. It gathers stories and photos from everyone who loves them and turns it into a gorgeous printed book. Sign up here and we both get $20:\n${referralUrl}`,
      },
    ],
    email: [
      {
        label: 'Referral email',
        body: `Subject: Something special for your missionary's homecoming\n\nHi,\n\nI wanted to share something I discovered called Memory Vault. It's the most thoughtful way I've seen to honor a missionary's service — you collect memories and photos from family and friends, and they get turned into a beautiful printed heirloom book.\n\nI've been setting one up and it couldn't be easier. If you sign up through my link, we both receive $20 toward a book:\n\n${referralUrl}\n\nI think you'll love it.\n\n— ${senderName}`,
      },
    ],
    facebook: [
      {
        label: 'Facebook referral post',
        body: `Missionary moms — I have to share this with you. 💛\n\nMemory Vault lets you collect stories, notes, and photos from everyone who loves your missionary and turns them into a stunning printed heirloom book. I just started one and I'm already emotional.\n\nSign up through my link and we both get $20 toward a book:\n${referralUrl}\n\nPlease share with any mom preparing for a farewell or homecoming! 🙏`,
      },
      {
        label: 'Facebook group referral',
        body: `If anyone here has a missionary coming home (or leaving soon), you need to check out Memory Vault. It collects memories from family and friends and prints them into a beautiful book — and it's so simple to set up.\n\nSign up here and we both get a $20 reward when you purchase your first book:\n${referralUrl}\n\n— ${senderName}`,
      },
    ],
    instagram: [
      {
        label: 'Instagram referral',
        body: `Missionary mamas, this one's for you. 📖💛\n\nMemory Vault makes it so simple to gather everyone's stories and turn them into a printed heirloom book your missionary will treasure forever. No scrapbooking, no chasing people, no layout stress — they do everything.\n\nLink in bio — when you sign up through my link we both get $20 toward a book. ✨ #MissionaryMom #HeirloomBook #MemoryVault`,
      },
    ],
    ward: [
      {
        label: 'Ward referral message',
        body: `Dear friends,\n\nI wanted to share a resource that has been a true blessing for our family. Memory Vault allows you to gather stories and photos from everyone who loves your missionary and have them printed into a beautiful heirloom book. It is simple to set up and the results are extraordinary.\n\nIf you sign up through my referral link, we both receive $20 toward a book:\n${referralUrl}\n\nI hope it blesses your family as much as it has ours.\n\n— ${senderName}`,
      },
      {
        label: 'Stake newsletter blurb',
        body: `Attention missionary families: Memory Vault is a beautiful way to collect memories from ward members, friends, and family and turn them into a printed heirloom book for your returning missionary. Learn more and sign up at the link below — use this referral to give both you and the person who referred you $20 off your first book:\n${referralUrl}`,
      },
    ],
  };

  const revealIdeas: RevealIdea[] = [
    {
      title: 'Right after the homecoming talk',
      body: 'Have the book waiting at the back of the chapel, wrapped simply in kraft paper and twine. The moment they step off the stand, hand it to them privately before the receiving line begins. That first quiet moment — just you and them — is when it will mean the most.',
    },
    {
      title: 'A sacred moment after a temple visit',
      body: "Plan a family temple visit in the days after they return. On the drive home or in a quiet room afterward, present the book as a continuation of the spiritual experience. Frame it as the world's witness to their covenants — the people they served, speaking directly to them.",
    },
    {
      title: 'A slideshow at the homecoming party',
      body: "Export the PDF and display each page as a slideshow on a TV or projector during the homecoming reception. Let guests see their own words and photos in print. This turns the Memory Book into a shared experience — not just a private keepsake but a moment the whole room shares together.",
    },
    {
      title: 'Waiting in their room when they get home',
      body: "Place the book on their pillow or nightstand, open to a meaningful page, before they arrive home for the first time. When they walk into their childhood room after two years away, it will be the first thing they see. Give them the quiet and the privacy to read it on their own, at their own pace.",
    },
  ];

  const mainTabs: { id: Tab; label: string }[] = [
    { id: 'contributors', label: 'Contributors' },
    { id: 'managers', label: 'Managers' },
    { id: 'referrals', label: 'Referrals' },
    { id: 'reveal', label: 'The Reveal' },
  ];

  
  const needsPlatform = activeTab === 'contributors' || activeTab === 'referrals';

  let messages: Message[] = [];
  if (activeTab === 'contributors') messages = contributorMessages[platform];
  else if (activeTab === 'managers') messages = managerMessages;
  else if (activeTab === 'referrals') messages = referralMessages[platform];

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare size={15} strokeWidth={1.5} className="text-[#555555]" />
        <PageTag>Message Bank</PageTag>
      </div>

      <p className="text-sm text-[#555555] mb-6" style={{ lineHeight: 1.7 }}>
        Ready-to-send messages for every step of the process. Pick a tab, choose your platform, copy, and paste.
      </p>

      {/* Main tabs */}
      <div className="flex gap-0 mb-6" style={{ borderBottom: '1px solid #e0deda' }}>
        {mainTabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="font-space-mono text-xs uppercase tracking-widest px-5 py-2.5 transition-colors"
            style={{
              color: activeTab === id ? '#222222' : '#555555',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === id ? '2px solid #222222' : '2px solid transparent',
              marginBottom: '-1px',
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>


      {/* Platform sub-tabs */}
      {needsPlatform && (
        <div className="flex flex-wrap gap-2 mb-6">
          {PLATFORM_TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setPlatform(id)}
              className="font-space-mono text-xs uppercase tracking-widest px-3 py-1.5 transition-colors"
              style={{
                border: '1px solid',
                borderColor: platform === id ? '#222222' : '#e0deda',
                backgroundColor: platform === id ? '#222222' : 'transparent',
                color: platform === id ? '#ffffff' : '#555555',
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Message cards */}
      {activeTab !== 'reveal' && (
        <div className="flex flex-col gap-4">
          {messages.map((msg, i) => (
            <MessageCard
              key={`${activeTab}-${platform}-${i}`}
              msgKey={`${activeTab}-${platform}-${i}`}
              label={msg.label}
              text={msg.body}
              copiedKey={copiedKey}
              onCopy={copy}
            />
          ))}
        </div>
      )}

      {/* Reveal ideas */}
      {activeTab === 'reveal' && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[#555555] mb-2" style={{ lineHeight: 1.7 }}>
            The moment you place the book in their hands will become part of the memory itself. Here are four ways to make it unforgettable.
          </p>
          {revealIdeas.map((idea) => (
            <RevealCard key={idea.title} title={idea.title} body={idea.body} />
          ))}
        </div>
      )}
    </div>
  );
}
