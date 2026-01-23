import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
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

// Feature card component
const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon: string;
  delay: number;
}> = ({ title, description, icon, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideIn = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const translateX = interpolate(slideIn, [0, 1], [100, 0]);
  const opacity = interpolate(slideIn, [0, 1], [0, 1]);

  return (
    <div
      style={{
        transform: `translateX(${translateX}px)`,
        opacity,
        backgroundColor: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: 24,
        padding: '40px 50px',
        marginBottom: 30,
        border: '1px solid rgba(255,255,255,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: 30,
      }}
    >
      <span style={{ fontSize: 60 }}>{icon}</span>
      <div>
        <h3
          style={{
            fontSize: 36,
            color: WHITE,
            margin: 0,
            fontWeight: 600,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: 24,
            color: 'rgba(255,255,255,0.7)',
            margin: '10px 0 0 0',
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
};

// Features sequence
const FeaturesSequence: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        padding: '0 150px',
      }}
    >
      <h2
        style={{
          fontSize: 64,
          color: WHITE,
          marginBottom: 50,
          textAlign: 'center',
        }}
      >
        Smart Features
      </h2>
      <FeatureCard
        icon="🤖"
        title="AI-Powered Analysis"
        description="Automatically extracts key information from school mailings"
        delay={0}
      />
      <FeatureCard
        icon="📅"
        title="Daily Reminders"
        description="Personalized reminders for each day of the week"
        delay={15}
      />
      <FeatureCard
        icon="🎒"
        title="PE Kit Alerts"
        description="Never forget PE kit, swimming gear, or equipment"
        delay={30}
      />
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

      {/* Title: 0-4 seconds */}
      <Sequence from={0} durationInFrames={120}>
        <TitleSequence />
      </Sequence>

      {/* Features: 4-11 seconds */}
      <Sequence from={120} durationInFrames={210}>
        <FeaturesSequence />
      </Sequence>

      {/* CTA: 11-15 seconds */}
      <Sequence from={330} durationInFrames={120}>
        <CTASequence />
      </Sequence>
    </AbsoluteFill>
  );
};
