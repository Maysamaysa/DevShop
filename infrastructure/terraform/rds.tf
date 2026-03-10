resource "aws_db_subnet_group" "devshop_db_subnet_group" {
  name       = "devshop-db-subnet-group"
  subnet_ids = module.vpc.private_subnets

  tags = {
    Name = "DevShop DB Subnet Group"
  }
}

resource "aws_security_group" "rds_sg" {
  name        = "devshop-rds-sg"
  description = "Allow inbound PostgreSQL traffic from EKS"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    cidr_blocks     = [module.vpc.vpc_cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "devshop_postgres" {
  identifier             = "devshop-postgres"
  instance_class         = "db.t2.micro"
  allocated_storage      = 20
  engine                 = "postgres"
  engine_version         = "18.2"
  username               = var.db_username
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.devshop_db_subnet_group.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  publicly_accessible    = false
  skip_final_snapshot    = true
}
