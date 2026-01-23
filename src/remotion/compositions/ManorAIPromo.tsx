import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  Img,
  staticFile,
} from 'remotion';

const DARK_GREEN = '#1C473B';
const ACCENT_GREEN = '#2D6A5A';
const WHITE = '#FFFFFF';

// Animated gradient background
const GradientBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const rotation = interpolate(frame, [0, 450], [0, 360]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${rotation}deg, ${DARK_GREEN} 0%, #0f2922 50%, ${DARK_GREEN} 100%)`,
      }}
    />
  );
};

// Floating particles effect
const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  const particles = Array.from({ length: 20 }, (_, i) => ({
    x: (i * 97) % 100,
    y: ((i * 73 + frame * 0.5) % 120) - 10,
    size: 2 + (i % 3),
    opacity: 0.1 + (i % 5) * 0.05,
  }));

  return (
    <AbsoluteFill>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            backgroundColor: WHITE,
            opacity: p.opacity,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// Title sequence
const TitleSequence: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const subtitleOpacity = interpolate(frame, [30, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          transform: `scale(${titleScale})`,
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: 120,
            fontWeight: 'bold',
            color: WHITE,
            margin: 0,
            textShadow: '0 4px 30px rgba(0,0,0,0.5)',
          }}
        >
          Manor AI
        </h1>
        <p
          style={{
            fontSize: 36,
            color: 'rgba(255,255,255,0.8)',
            marginTop: 20,
            opacity: subtitleOpacity,
          }}
        >
          Intelligent School Reminders
        </p>
      </div>
    </AbsoluteFill>
  );
};

// Screenshot display with browser frame
const BrowserFrame: React.FC<{
  screenshotPath: string;
  title: string;
  delay?: number;
}> = ({ screenshotPath, title, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideIn = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const scale = interpolate(slideIn, [0, 1], [0.8, 1]);
  const opacity = interpolate(slideIn, [0, 1], [0, 1]);
  const translateY = interpolate(slideIn, [0, 1], [50, 0]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        transform: `scale(${scale}) translateY(${translateY}px)`,
        opacity,
      }}
    >
      {/* Browser chrome */}
      <div
        style={{
          width: 1600,
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 25px 80px rgba(0,0,0,0.5)',
        }}
      >
        {/* Browser header */}
        <div
          style={{
            backgroundColor: '#2d2d2d',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          {/* Traffic lights */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff5f57' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#febc2e' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#28c840' }} />
          </div>
          {/* URL bar */}
          <div
            style={{
              flex: 1,
              backgroundColor: '#1a1a1a',
              borderRadius: 6,
              padding: '8px 16px',
              color: 'rgba(255,255,255,0.6)',
              fontSize: 14,
            }}
          >
            manor-ai.app
          </div>
        </div>
        {/* Screenshot */}
        <div style={{ position: 'relative', height: 850, overflow: 'hidden' }}>
          <Img
            src={staticFile(screenshotPath)}
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'cover',
              objectPosition: 'top',
            }}
          />
        </div>
      </div>
      {/* Caption */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '12px 30px',
          borderRadius: 30,
        }}
      >
        <span style={{ color: WHITE, fontSize: 24, fontWeight: 500 }}>{title}</span>
      </div>
    </AbsoluteFill>
  );
};

// Feature highlight with screenshot
const FeatureShowcase: React.FC<{
  screenshotPath: string;
  title: string;
  description: string;
  reverse?: boolean;
}> = ({ screenshotPath, title, description, reverse = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideIn = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const translateX = interpolate(slideIn, [0, 1], [reverse ? -100 : 100, 0]);
  const opacity = interpolate(slideIn, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        flexDirection: reverse ? 'row-reverse' : 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 80px',
        gap: 60,
      }}
    >
      {/* Screenshot */}
      <div
        style={{
          transform: `translateX(${translateX}px)`,
          opacity,
          width: 900,
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}
      >
        <Img
          src={staticFile(screenshotPath)}
          style={{
            width: '100%',
            height: 'auto',
          }}
        />
      </div>
      {/* Text content */}
      <div
        style={{
          transform: `translateX(${-translateX}px)`,
          opacity,
          maxWidth: 500,
        }}
      >
        <h2
          style={{
            fontSize: 56,
            color: WHITE,
            marginBottom: 20,
            fontWeight: 700,
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontSize: 28,
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      </div>
    </AbsoluteFill>
  );
};

// Call to action sequence
const CTASequence: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pulse = Math.sin(frame * 0.1) * 5;

  const scale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 100 },
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          transform: `scale(${scale})`,
        }}
      >
        <h2
          style={{
            fontSize: 72,
            color: WHITE,
            marginBottom: 40,
          }}
        >
          Stay Organized
        </h2>
        <div
          style={{
            backgroundColor: ACCENT_GREEN,
            padding: '25px 60px',
            borderRadius: 16,
            transform: `translateY(${pulse}px)`,
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          }}
        >
          <span
            style={{
              fontSize: 36,
              color: WHITE,
              fontWeight: 600,
            }}
          >
            Try Manor AI Today
          </span>
        </div>
        <p
          style={{
            fontSize: 28,
            color: 'rgba(255,255,255,0.6)',
            marginTop: 40,
          }}
        >
          Smart reminders for busy parents
        </p>
      </div>
    </AbsoluteFill>
  );
};

// Main composition
export const ManorAIPromo: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: 'system-ui, sans-serif' }}>
      <GradientBackground />
      <Particles />

      {/* Title: 0-3 seconds */}
      <Sequence from={0} durationInFrames={90}>
        <TitleSequence />
      </Sequence>

      {/* Home page showcase: 3-7 seconds */}
      <Sequence from={90} durationInFrames={120}>
        <BrowserFrame
          screenshotPath="assets/home.png"
          title="Beautiful Parent Dashboard"
        />
      </Sequence>

      {/* Feature 1: Daily Reminders: 7-11 seconds */}
      <Sequence from={210} durationInFrames={120}>
        <FeatureShowcase
          screenshotPath="assets/home.png"
          title="Daily Reminders"
          description="AI-powered reminders tailored to your child's schedule. Never miss PE kit day again!"
        />
      </Sequence>

      {/* Admin Dashboard: 11-14 seconds */}
      <Sequence from={330} durationInFrames={90}>
        <FeatureShowcase
          screenshotPath="assets/admin-dashboard.png"
          title="Easy Admin"
          description="Powerful admin panel to manage year groups, documents, and settings."
          reverse
        />
      </Sequence>

      {/* CTA: 14-17 seconds */}
      <Sequence from={420} durationInFrames={90}>
        <CTASequence />
      </Sequence>
    </AbsoluteFill>
  );
};
