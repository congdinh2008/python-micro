"""
OpenTelemetry Tracing Configuration
Configures distributed tracing with Jaeger
"""

import os
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource, SERVICE_NAME, SERVICE_VERSION
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
from opentelemetry.instrumentation.redis import RedisInstrumentor


def setup_tracing(app, service_name: str, service_version: str = "1.0.0"):
    """
    Setup OpenTelemetry tracing for FastAPI application
    
    Args:
        app: FastAPI application instance
        service_name: Name of the service
        service_version: Version of the service
    """
    # Get Jaeger endpoint from environment variable
    jaeger_endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://jaeger:4317")
    
    # Create resource with service information
    resource = Resource(attributes={
        SERVICE_NAME: service_name,
        SERVICE_VERSION: service_version,
        "environment": os.getenv("ENVIRONMENT", "production"),
    })
    
    # Create tracer provider
    tracer_provider = TracerProvider(resource=resource)
    
    # Create OTLP exporter
    otlp_exporter = OTLPSpanExporter(
        endpoint=jaeger_endpoint,
        insecure=True,  # Use insecure connection for development
    )
    
    # Add batch span processor
    span_processor = BatchSpanProcessor(otlp_exporter)
    tracer_provider.add_span_processor(span_processor)
    
    # Set global tracer provider
    trace.set_tracer_provider(tracer_provider)
    
    # Instrument FastAPI
    FastAPIInstrumentor.instrument_app(app)
    
    # Instrument SQLAlchemy
    SQLAlchemyInstrumentor().instrument()
    
    # Instrument HTTPX for inter-service tracing
    HTTPXClientInstrumentor().instrument()
    
    # Instrument Redis
    RedisInstrumentor().instrument()
    
    print(f"✅ OpenTelemetry tracing configured for {service_name}")
    print(f"📊 Traces will be sent to: {jaeger_endpoint}")
    print(f"🔍 Jaeger UI: http://localhost:16686")
